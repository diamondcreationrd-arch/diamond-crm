import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, Target, TrendingUp, Zap, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clients, leadsThisMonth, totalLeads, activeCampaigns, recentLeads] = await Promise.all([
    prisma.client.count({ where: { agencyId, isActive: true } }),
    prisma.lead.count({ where: { client: { agencyId }, createdAt: { gte: firstOfMonth } } }),
    prisma.lead.count({ where: { client: { agencyId } } }),
    prisma.campaign.count({ where: { client: { agencyId }, status: "ACTIVE" } }),
    prisma.lead.findMany({
      where: { client: { agencyId } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { client: { select: { businessName: true } }, campaign: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Clients actifs", value: clients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Leads ce mois", value: leadsThisMonth, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", sub: "+12%" },
    { label: "Leads total", value: totalLeads, icon: TrendingUp, color: "text-diamond-gold-dark", bg: "bg-diamond-gold-bg" },
    { label: "Campagnes actives", value: activeCampaigns, icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const statusColors: Record<string, string> = {
    NEW: "badge-blue", CONTACTED: "badge-gold", QUALIFIED: "badge-green",
    UNQUALIFIED: "badge-gray", CONVERTED: "badge-green", LOST: "badge-red",
  };
  const statusLabels: Record<string, string> = {
    NEW: "Nouveau", CONTACTED: "Contacté", QUALIFIED: "Qualifié",
    UNQUALIFIED: "Non qualifié", CONVERTED: "Converti", LOST: "Perdu",
  };

  return (
    <div className="flex-1 overflow-auto bg-diamond-bg">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue globale — tous vos clients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={17} className={color} />
                </div>
                {sub && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">{sub}</span>}
              </div>
              <p className="font-display font-bold text-diamond-text text-2xl">{value}</p>
              <p className="text-diamond-muted text-xs font-body mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent leads */}
          <div className="col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-diamond-border">
              <h2 className="font-display font-semibold text-diamond-text">Leads récents</h2>
              <Link href="/admin/leads" className="text-diamond-gold text-xs font-body hover:text-diamond-gold-dark flex items-center gap-1">
                Voir tous <ArrowUpRight size={12} />
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-diamond-muted">
                <Target size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-body">Aucun lead pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-diamond-border">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 px-6 py-3 hover:bg-diamond-bg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-diamond-raised flex items-center justify-center text-xs font-semibold text-diamond-muted shrink-0">
                      {(lead.firstName?.[0] ?? lead.email?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-diamond-text text-sm font-medium truncate">
                        {lead.firstName && lead.lastName ? `${lead.firstName} ${lead.lastName}` : lead.email ?? "Lead anonyme"}
                      </p>
                      <p className="text-diamond-muted text-xs font-body">{lead.client.businessName}</p>
                    </div>
                    <span className={statusColors[lead.status] ?? "badge-gray"}>{statusLabels[lead.status] ?? lead.status}</span>
                    <p className="text-diamond-muted text-xs font-body flex items-center gap-1 shrink-0">
                      <Clock size={10} />
                      {new Date(lead.createdAt).toLocaleDateString("fr-CA", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clients panel */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-diamond-border">
              <h2 className="font-display font-semibold text-diamond-text">Clients</h2>
              <Link href="/admin/clients" className="text-diamond-gold text-xs font-body hover:text-diamond-gold-dark flex items-center gap-1">
                Voir tous <ArrowUpRight size={12} />
              </Link>
            </div>
            <ClientsList agencyId={agencyId} />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ClientsList({ agencyId }: { agencyId: string }) {
  const clients = await prisma.client.findMany({
    where: { agencyId, isActive: true },
    take: 6,
    include: {
      _count: { select: { leads: true, campaigns: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="divide-y divide-diamond-border">
      {clients.map((c) => (
        <Link key={c.id} href={`/admin/clients/${c.id}`}
          className="flex items-center gap-3 px-5 py-3 hover:bg-diamond-bg transition-colors">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: c.brandColor }}>
            {c.businessName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-diamond-text text-sm font-medium truncate">{c.businessName}</p>
            <p className="text-diamond-muted text-xs font-body">{c._count.leads} leads · {c._count.campaigns} campagnes</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        </Link>
      ))}
      {clients.length === 0 && (
        <div className="py-12 text-center text-diamond-muted text-sm font-body">Aucun client</div>
      )}
      <Link href="/admin/clients/new"
        className="flex items-center justify-center gap-1.5 px-5 py-3 text-diamond-gold text-xs font-body hover:bg-diamond-gold-bg transition-colors">
        + Ajouter un client
      </Link>
    </div>
  );
}
