import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { ClientsOverview } from "@/components/dashboard/ClientsOverview";
import { Users, Target, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const [totalClients, totalLeads, totalCampaigns, recentLeads, clients] = await Promise.all([
    prisma.client.count({ where: { agencyId } }),
    prisma.lead.count({
      where: { client: { agencyId } }
    }),
    prisma.campaign.count({ where: { client: { agencyId } } }),
    prisma.lead.findMany({
      where: { client: { agencyId } },
      include: { client: true, campaign: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.client.findMany({
      where: { agencyId, isActive: true },
      include: {
        _count: { select: { leads: true, campaigns: true } },
        leads: {
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const leadsThisMonth = await prisma.lead.count({
    where: {
      client: { agencyId },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">
          Tableau de bord
        </h1>
        <p className="text-diamond-muted mt-1">Vue globale — tous vos clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Clients actifs" value={totalClients} icon={Users} />
        <StatCard title="Leads ce mois" value={leadsThisMonth} icon={Target} trend="+12%" />
        <StatCard title="Leads total" value={totalLeads} icon={TrendingUp} />
        <StatCard title="Campagnes actives" value={totalCampaigns} icon={DollarSign} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecentLeadsTable leads={recentLeads} showClient />
        </div>
        <div>
          <ClientsOverview clients={clients} />
        </div>
      </div>
    </div>
  );
}
