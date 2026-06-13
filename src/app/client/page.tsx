import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { CampaignMetrics } from "@/components/dashboard/CampaignMetrics";
import { Target, TrendingUp, DollarSign, CheckCircle } from "lucide-react";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [leadsTotal, leadsThisMonth, leadsConverted, campaigns, recentLeads] = await Promise.all([
    prisma.lead.count({ where: { clientId } }),
    prisma.lead.count({ where: { clientId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { clientId, isConverted: true } }),
    prisma.campaign.findMany({
      where: { clientId },
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.lead.findMany({
      where: { clientId },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalSpend = campaigns.reduce((s: number, c: any) => s + c.totalSpend, 0);
  const cpl = leadsTotal > 0 && totalSpend > 0 ? (totalSpend / leadsTotal).toFixed(2) : "—";

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-diamond-text">Mon Dashboard</h1>
        <p className="text-diamond-muted mt-1">Résultats des 30 derniers jours</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Leads ce mois" value={leadsThisMonth} icon={Target} />
        <StatCard title="Leads total" value={leadsTotal} icon={TrendingUp} />
        <StatCard title="Convertis" value={leadsConverted} icon={CheckCircle} />
        <StatCard title="Coût / Lead" value={cpl === "—" ? "—" : `$${cpl}`} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecentLeadsTable leads={recentLeads} />
        </div>
        <div>
          <CampaignMetrics campaigns={campaigns} />
        </div>
      </div>
    </div>
  );
}
