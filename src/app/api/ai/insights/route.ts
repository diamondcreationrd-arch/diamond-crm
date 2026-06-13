import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const clientId = user.role === "SUPER_ADMIN" ? body.clientId : user.clientId;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const [client, leads, campaigns] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { source: true, status: true, isQualified: true, isConverted: true, createdAt: true, platform: true },
    }),
    prisma.campaign.findMany({
      where: { clientId },
      select: { name: true, platform: true, status: true, budget: true, totalSpend: true, totalLeads: true, totalConversions: true },
    }),
  ]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentLeads = leads.filter((l: any) => new Date(l.createdAt) > thirtyDaysAgo);
  const bySource = recentLeads.reduce((acc: any, l: any) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {});
  const byStatus = leads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const conversionRate = leads.length > 0 ? ((leads.filter((l: any) => l.isConverted).length / leads.length) * 100).toFixed(1) : "0";
  const qualificationRate = leads.length > 0 ? ((leads.filter((l: any) => l.isQualified).length / leads.length) * 100).toFixed(1) : "0";

  const dataContext = `Client: ${client?.businessName}\nLeads ce mois: ${recentLeads.length}\nTotal leads: ${leads.length}\nTaux conversion: ${conversionRate}%\nTaux qualification: ${qualificationRate}%\nPar source: ${JSON.stringify(bySource)}\nPar statut: ${JSON.stringify(byStatus)}\nCampagnes: ${JSON.stringify(campaigns.map((c: any) => ({ name: c.name, platform: c.platform, status: c.status, spend: c.totalSpend, leads: c.totalLeads })))}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let report = "";

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1200,
          messages: [{ role: "user", content: `Tu es un expert en marketing digital pour une agence québécoise. Analyse ces données CRM et génère un rapport d'insights en français, concis et actionnable. Structure: 1) Résumé performance (2-3 phrases), 2) Points forts (2 bullets), 3) Axes d'amélioration (2-3 recommandations concrètes avec des chiffres), 4) Action prioritaire cette semaine. Sois direct et précis.\n\n${dataContext}` }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        report = data.content[0]?.text ?? "";
      }
    } catch (_) {}
  }

  if (!report) {
    const topSource = Object.entries(bySource).sort((a: any, b: any) => b[1] - a[1])[0];
    report = `**Résumé de performance**\n${client?.businessName} a généré ${recentLeads.length} leads ce mois avec un taux de conversion de ${conversionRate}%. ${recentLeads.length > 10 ? "La performance est stable." : "Le volume de leads reste faible — activation de nouvelles sources recommandée."}\n\n**Points forts**\n• ${topSource ? `Source principale : ${topSource[0]} — ${topSource[1]} leads ce mois` : "Diversification des sources en cours"}\n• Tracking opérationnel sur toutes les plateformes actives\n\n**Axes d'amélioration**\n• Réduire le délai de contact des nouveaux leads (objectif : <2h)\n• Lancer des tests A/B sur les landing pages pour améliorer le taux de conversion\n• Activer les relances automatiques par SMS pour les leads qualifiés non convertis\n\n**Action prioritaire cette semaine**\nContacter les ${byStatus["NEW"] ?? 0} leads au statut "Nouveau" — chaque heure de délai réduit les chances de conversion de 10%.`;
  }

  return NextResponse.json({ report, data: { leads: leads.length, recentLeads: recentLeads.length, conversionRate, qualificationRate, bySource, byStatus, campaigns: campaigns.length } });
}
