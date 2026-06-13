import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  marketing: "Tu es un expert en marketing digital pour agences québécoises. Tu aides avec la stratégie de contenu, les campagnes, le positionnement et la croissance. Réponds en français, de façon concrète et actionnables.",
  seo: "Tu es un expert SEO spécialisé pour les PME locales au Québec. Tu aides avec le référencement naturel, les mots-clés locaux, l'audit et Google My Business. Réponds en français, avec des étapes précises.",
  ads: "Tu es un expert en publicité digitale (Meta Ads, Google Ads, TikTok Ads). Tu optimises les ROAS, réduis les CPL et structures des campagnes performantes. Réponds en français avec des chiffres concrets.",
  analytics: "Tu es un analyste data spécialisé en marketing digital. Tu interprètes les KPIs, crées des rapports clairs et identifies les insights clés. Réponds en français de façon pédagogique.",
  crm: "Tu es un expert en gestion de la relation client et en lead nurturing. Tu aides avec les pipelines de vente, la qualification de leads et la rétention client. Réponds en français avec des scripts et templates prêts à l'emploi.",
  growth: "Tu es un expert en growth hacking et stratégie de croissance pour agences marketing. Tu aides à acquérir de nouveaux clients, fidéliser et augmenter le LTV. Réponds en français avec des tactiques concrètes.",
  default: "Tu es un expert en marketing digital pour une agence québécoise. Analyse les données CRM et génère des insights actionnables en français.",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();

  // Agent chat mode (has prompt + agentType)
  if (body.prompt && body.agentType) {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[body.agentType] ?? AGENT_SYSTEM_PROMPTS.default;
    const contextStr = body.context
      ? `\n\nContexte agence: ${body.context.clients?.length ?? 0} clients actifs, ${body.context.totalLeads ?? 0} leads total, ${body.context.totalCampaigns ?? 0} campagnes.`
      : "";

    const apiKey = process.env.GROQ_API_KEY;
    let reply = "";

    if (apiKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1000,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: body.prompt + contextStr },
            ],
          }),
        });
        const raw = await res.text();
        if (!res.ok) {
          reply = "Erreur " + res.status + ": " + raw.slice(0, 200);
        } else {
          const data = JSON.parse(raw);
          reply = data.choices[0]?.message?.content ?? "";
        }
      } catch (e: any) {
        reply = `Erreur API: ${e.message}`;
      }
    }

    if (!reply) {
      reply = `[Mode démo — ajoutez GROQ_API_KEY dans Railway pour activer l'IA]\n\nVotre question : "${body.prompt}"\n\nEn tant que ${AGENT_SYSTEM_PROMPTS[body.agentType]?.split(".")[0]}, voici une réponse générique : consultez vos données CRM, identifiez les tendances clés, et agissez sur les opportunités immédiates.`;
    }

    return NextResponse.json({ insights: reply });
  }

  // Report mode (clientId-based)
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
      select: { name: true, platform: true, status: true, totalSpend: true, totalLeads: true, totalConversions: true },
    }),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLeads = leads.filter((l: any) => new Date(l.createdAt) > thirtyDaysAgo);
  const bySource = recentLeads.reduce((acc: any, l: any) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {});
  const byStatus = leads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const conversionRate = leads.length > 0 ? ((leads.filter((l: any) => l.isConverted).length / leads.length) * 100).toFixed(1) : "0";
  const qualificationRate = leads.length > 0 ? ((leads.filter((l: any) => l.isQualified).length / leads.length) * 100).toFixed(1) : "0";

  const dataContext = `Client: ${client?.businessName}\nLeads ce mois: ${recentLeads.length}\nTotal leads: ${leads.length}\nTaux conversion: ${conversionRate}%\nTaux qualification: ${qualificationRate}%\nPar source: ${JSON.stringify(bySource)}\nPar statut: ${JSON.stringify(byStatus)}\nCampagnes: ${JSON.stringify(campaigns.map((c: any) => ({ name: c.name, platform: c.platform, spend: c.totalSpend, leads: c.totalLeads })))}`;

  const apiKey = process.env.GROQ_API_KEY;
  let report = "";

  if (apiKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1200,
          messages: [
            { role: "system", content: "Tu es un expert en marketing digital pour une agence québécoise. Génère des rapports d'insights en français, concis et actionnables." },
            { role: "user", content: `Analyse ces données CRM et génère un rapport d'insights. Structure: 1) Résumé performance, 2) Points forts, 3) Axes d'amélioration avec recommandations concrètes, 4) Action prioritaire cette semaine.\n\n${dataContext}` },
          ],
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        report = "Erreur " + res.status + ": " + raw.slice(0, 200);
      } else {
        const data = JSON.parse(raw);
        report = data.choices[0]?.message?.content ?? "";
      }
    } catch (e: any) {
      report = `Erreur API: ${e.message}`;
    }
  }

  if (!report) {
    const topSource = Object.entries(bySource).sort((a: any, b: any) => b[1] - a[1])[0];
    report = `**Résumé de performance**\n${client?.businessName} a généré ${recentLeads.length} leads ce mois avec un taux de conversion de ${conversionRate}%.\n\n**Points forts**\n• ${topSource ? `Source principale : ${topSource[0]} (${topSource[1]} leads)` : "Tracking opérationnel"}\n• ${campaigns.length} campagne(s) active(s)\n\n**Axes d'amélioration**\n• Réduire le délai de contact (<2h par lead)\n• Tester des landing pages A/B\n• Activer les relances automatiques\n\n**Action prioritaire**\nContacter les ${byStatus["NEW"] ?? 0} leads au statut "Nouveau" — chaque heure de délai réduit les chances de conversion de 10%.`;
  }

  return NextResponse.json({ report, insights: report });
}
