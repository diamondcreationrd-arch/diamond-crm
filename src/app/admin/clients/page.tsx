import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users, TrendingUp, Target } from "lucide-react";

export default async function AdminClients() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const clients = await prisma.client.findMany({
    where: { agencyId },
    include: {
      _count: { select: { leads: true, campaigns: true, landingPages: true } },
      leads: {
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { id: true },
      },
      campaigns: {
        where: { status: "ACTIVE" },
        select: { id: true, totalSpend: true, totalLeads: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-diamond-muted mt-1">{clients.length} client{clients.length !== 1 ? "s" : ""} actif{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/clients/new" className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Nouveau client
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clients.length === 0 && (
          <div className="card text-center py-16">
            <Users size={40} className="text-diamond-muted mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Aucun client encore</p>
            <p className="text-diamond-muted text-sm mb-6">Ajoutez votre premier client pour commencer</p>
            <Link href="/admin/clients/new" className="btn-gold inline-flex items-center gap-2">
              <Plus size={16} /> Ajouter un client
            </Link>
          </div>
        )}

        {clients.map((client) => {
          const totalSpend = client.campaigns.reduce((s: number, c: any) => s + c.totalSpend, 0);
          const totalLeads = client.campaigns.reduce((s: number, c: any) => s + c.totalLeads, 0);
          const cpl = totalLeads > 0 && totalSpend > 0 ? (totalSpend / totalLeads).toFixed(2) : null;

          return (
            <Link key={client.id} href={`/admin/clients/${client.id}`}
              className="card hover:border-diamond-gold/40 transition-all group flex items-center gap-6">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
                style={{ background: client.brandColor + "25", border: `1px solid ${client.brandColor}40`, color: client.brandColor }}>
                {client.businessName.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{client.businessName}</p>
                  <span className={client.isActive ? "badge-green" : "badge-red"}>
                    {client.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
                <p className="text-diamond-muted text-sm">{client.contactName} · {client.contactEmail}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 text-center shrink-0">
                <div>
                  <p className="text-diamond-gold font-bold text-lg">{client.leads.length}</p>
                  <p className="text-diamond-muted text-xs">Leads / mois</p>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{client._count.campaigns}</p>
                  <p className="text-diamond-muted text-xs">Campagnes</p>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{client._count.landingPages}</p>
                  <p className="text-diamond-muted text-xs">Landing pages</p>
                </div>
                {cpl && (
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">${cpl}</p>
                    <p className="text-diamond-muted text-xs">CPL</p>
                  </div>
                )}
              </div>

              <div className="text-diamond-muted group-hover:text-diamond-gold transition-colors">→</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
