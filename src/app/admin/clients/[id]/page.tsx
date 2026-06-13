import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, Globe, DollarSign } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const client = await prisma.client.findFirst({
    where: { id: params.id, agencyId },
    include: {
      campaigns: { include: { _count: { select: { leads: true } } }, orderBy: { createdAt: "desc" } },
      landingPages: { orderBy: { createdAt: "desc" } },
      users: { select: { id: true, name: true, email: true, lastLoginAt: true } },
      notifications: true,
    },
  });

  if (!client) notFound();

  const [leadsTotal, leadsThisMonth, leads] = await Promise.all([
    prisma.lead.count({ where: { clientId: client.id } }),
    prisma.lead.count({ where: { clientId: client.id, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.lead.findMany({ where: { clientId: client.id }, include: { campaign: true }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const totalSpend = client.campaigns.reduce((s: number, c: any) => s + c.totalSpend, 0);
  const cpl = leadsTotal > 0 && totalSpend > 0 ? `$${(totalSpend / leadsTotal).toFixed(2)}` : "—";

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/clients" className="text-diamond-muted hover:text-white"><ArrowLeft size={20} /></Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: client.brandColor + "25", color: client.brandColor, border: `1px solid ${client.brandColor}40` }}>
            {client.businessName.charAt(0)}
          </div>
          <div>
            <h1 className="page-title">{client.businessName}</h1>
            <p className="text-diamond-muted text-sm">{client.contactName} · {client.contactEmail}</p>
          </div>
          <span className={`ml-2 ${client.isActive ? "badge-green" : "badge-red"}`}>
            {client.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Leads ce mois" value={leadsThisMonth} icon={Target} />
        <StatCard title="Leads total" value={leadsTotal} icon={TrendingUp} />
        <StatCard title="Campagnes" value={client.campaigns.length} icon={DollarSign} />
        <StatCard title="Coût / Lead" value={cpl} icon={Globe} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <RecentLeadsTable leads={leads} />

          {/* Campaigns */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-diamond-text">Campagnes</h2>
              <Link href={`/admin/campaigns?clientId=${client.id}`} className="text-diamond-gold text-sm hover:underline">Gérer</Link>
            </div>
            {client.campaigns.length === 0
              ? <p className="text-diamond-muted text-sm">Aucune campagne</p>
              : <div className="space-y-2">
                  {client.campaigns.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-diamond-black rounded-lg border border-diamond-border">
                      <div>
                        <p className="text-white text-sm font-medium">{c.name}</p>
                        <p className="text-diamond-muted text-xs">{c.platform ?? "—"} · {c.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-diamond-gold text-sm font-semibold">{c._count.leads} leads</p>
                        <p className="text-diamond-muted text-xs">${c.totalSpend} dépensé</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Landing pages */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-diamond-text">Landing Pages</h2>
              <Link href={`/admin/landing-pages?clientId=${client.id}`} className="text-diamond-gold text-sm hover:underline">Gérer</Link>
            </div>
            {client.landingPages.length === 0
              ? <p className="text-diamond-muted text-sm">Aucune landing page</p>
              : client.landingPages.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-diamond-border last:border-0">
                    <div>
                      <p className="text-white text-sm">{p.name}</p>
                      <p className="text-diamond-muted text-xs">{p.views} vues · {p.submissions} soumissions</p>
                    </div>
                    <span className={p.isPublished ? "badge-green" : "badge-gray"}>
                      {p.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                ))
            }
          </div>

          {/* Users */}
          <div className="card">
            <h2 className="font-semibold text-diamond-text mb-4">Accès portail</h2>
            {client.users.map((u: any) => (
              <div key={u.id} className="py-2 border-b border-diamond-border last:border-0">
                <p className="text-white text-sm">{u.name}</p>
                <p className="text-diamond-muted text-xs">{u.email}</p>
                <p className="text-diamond-muted text-xs">
                  {u.lastLoginAt ? `Dernière connexion: ${new Date(u.lastLoginAt).toLocaleDateString("fr-CA")}` : "Jamais connecté"}
                </p>
              </div>
            ))}
          </div>

          {/* Notifications */}
          {client.notifications[0] && (
            <div className="card">
              <h2 className="font-semibold text-diamond-text mb-4">Notifications</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-diamond-muted">Email</span>
                  <span className={client.notifications[0].emailEnabled ? "text-emerald-400" : "text-diamond-muted"}>
                    {client.notifications[0].emailEnabled ? client.notifications[0].emailAddress : "Désactivé"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-diamond-muted">SMS</span>
                  <span className={client.notifications[0].smsEnabled ? "text-emerald-400" : "text-diamond-muted"}>
                    {client.notifications[0].smsEnabled ? client.notifications[0].phoneNumber : "Désactivé"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
