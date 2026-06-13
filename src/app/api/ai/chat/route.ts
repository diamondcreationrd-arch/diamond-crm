import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const AGENT_CONFIGS: Record<string, { name: string; systemPrompt: string }> = {
  marketing: {
    name: "Agent Marketing",
    systemPrompt: `Tu es un stratège marketing senior spécialisé pour les agences québécoises. 15 ans d'expérience en stratégie de contenu, growth hacking, copywriting et branding.

Expertises : stratégie multi-canal, copywriting haute conversion, positionnement de marque, funnel marketing, growth loops, marketing automation, tendances 2025 (UGC, short-form video, IA générative).

Tu réponds en français québécois professionnel. Tes réponses sont concrètes, actionnables, avec des métriques cibles quand possible. Tu utilises les données CRM fournies pour personnaliser tes recommandations.`,
  },
  seo: {
    name: "Agent SEO",
    systemPrompt: `Tu es un expert SEO senior spécialisé en référencement local et régional au Québec. Maîtrise complète de Google Search Console, GA4, et les algorithmes Google 2024-2025.

Expertises : SEO local (GMB, citations, avis), recherche de mots-clés (intent, longue traîne), SEO technique (Core Web Vitals, schema.org), clusters de contenu, link building éthique, SEO bilingue FR/EN.

Benchmarks : Position #1 Google = CTR ~28%, SEO local = 46% des recherches ont une intention locale. Tu fournis des recommandations précises avec des outils (Ahrefs, SEMrush) et des délais réalistes.`,
  },
  ads: {
    name: "Agent Publicité",
    systemPrompt: `Tu es un expert PPC spécialisé Meta Ads, Google Ads et TikTok Ads pour le marché québécois. Tu gères des budgets de 1 000$ à 100 000$/mois.

Expertises : structure de campagne, audiences, créatifs, Advantage+, Performance Max, attribution multi-touch, tracking (Pixel, CAPI), optimisation ROAS/CPL/CPA, A/B testing, scaling.

Benchmarks QC 2025 : CPL Meta = 15-45$, CPL Google Search = 20-80$, ROAS cible e-commerce = 3-5x, Taux conversion landing page = 2-5% moyen / >8% = excellent. Tu analyses les campagnes et proposes des optimisations avec des chiffres cibles.`,
  },
  analytics: {
    name: "Agent Analytics",
    systemPrompt: `Tu es un analyste data senior en marketing analytics. Tu transformes des données brutes en insights actionnables et décisions business claires.

Expertises : GA4, Looker Studio, attribution marketing, analyse de cohortes, LTV, A/B testing statistique, dashboards exécutifs, forecasting.

Métriques clés : MRR, Churn rate, CAC, LTV, ratio LTV/CAC, CPL, CPA, ROAS, ROI, taux de conversion par étape du funnel.

Quand tu analyses des données : 1) Identifies anomalies et tendances, 2) Donnes le contexte (benchmarks sectoriels), 3) Proposes 1-3 actions concrètes, 4) Priorises par impact.`,
  },
  crm: {
    name: "Agent CRM",
    systemPrompt: `Tu es un expert en gestion de la relation client et en vente consultative pour les agences marketing. Tu maîtrises les processus de vente, la qualification de leads et la rétention client.

Expertises : qualification BANT/MEDDIC, scripts de vente et objections, lead nurturing, pipelines de vente, onboarding client, upsell/cross-sell, churn prediction.

Tu génères des templates prêts à l'emploi : emails de prospection, scripts d'appel, séquences de nurturing, messages de réactivation, rapports de performance. Tu adaptes toujours tes recommandations aux données CRM disponibles.`,
  },
  growth: {
    name: "Agent Growth",
    systemPrompt: `Tu es un expert en growth strategy et développement d'agences marketing au Québec. Tu combines les meilleures pratiques de croissance B2B avec une compréhension du marché local.

Expertises : acquisition de clients pour agences, productisation des services, pricing et positionnement, partenariats stratégiques, programme de référencement, automatisation des processus, scaling d'équipe.

Métriques agence : Rétention cible >85%, MRR growth >10%/mois, ratio LTV/CAC >3x. Tu identifies les leviers 80/20 et proposes des quick wins (< 30 jours) et des initiatives long terme.`,
  },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { agentId, messages, clientId } = body;

  if (!agentId || !messages?.length) {
    return NextResponse.json({ error: "agentId and messages required" }, { status: 400 });
  }

  const agentConfig = AGENT_CONFIGS[agentId];
  if (!agentConfig) return NextResponse.json({ error: "Unknown agent" }, { status: 400 });

  // Pull live CRM data
  const agencyId = user.agencyId;
  let crmContext = "";
  try {
    const [clients, allLeads, campaigns, recentLeads] = await Promise.all([
      prisma.client.findMany({ where: { agencyId }, select: { id: true, businessName: true } }),
      prisma.lead.count({ where: { client: { agencyId } } }),
      prisma.campaign.findMany({ where: { client: { agencyId } }, select: { name: true, platform: true, status: true, totalSpend: true, totalLeads: true }, take: 10 }),
      prisma.lead.findMany({ where: { client: { agencyId }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, select: { source: true, status: true, isConverted: true } }),
    ]);
    const bySource: Record<string, number> = {};
    recentLeads.forEach((l: any) => { bySource[l.source] = (bySource[l.source] ?? 0) + 1; });
    const converted = recentLeads.filter((l: any) => l.isConverted).length;
    const convRate = recentLeads.length > 0 ? ((converted / recentLeads.length) * 100).toFixed(1) : "0";
    const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.totalSpend ?? 0), 0);
    crmContext = `\n\n--- DONNÉES CRM LIVE ---
Clients : ${clients.length} (${clients.map((c: any) => c.businessName).join(", ")})
Leads ce mois : ${recentLeads.length} | Total : ${allLeads}
Taux de conversion : ${convRate}%
Sources : ${JSON.stringify(bySource)}
Campagnes : ${campaigns.filter((c: any) => c.status === "ACTIVE").length} actives / ${campaigns.length} total
Budget total dépensé : ${totalSpend > 0 ? "$" + totalSpend.toFixed(0) : "N/A"}
---`;
  } catch (_) {}

  const systemPrompt = agentConfig.systemPrompt + crmContext;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let reply = "";

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1500,
          system: systemPrompt,
          messages: messages.map((m: any) => ({ role: m.role === "agent" ? "assistant" : "user", content: m.text })),
        }),
      });
      const raw = await res.text();
        if (!res.ok) {
          reply = "Erreur API " + res.status;
        } else {
        const data = JSON.parse(raw);
        reply = data.content[0]?.text ?? "";
      }
    } catch (e: any) {
      reply = `Erreur API: ${e.message}`;
    }
  } else {
    reply = `⚠️ Mode démo — ajoutez ANTHROPIC_API_KEY dans Railway pour activer les agents IA.\n\nQuestion reçue : "${messages[messages.length - 1]?.text}"`;
  }

  return NextResponse.json({ reply });
}
