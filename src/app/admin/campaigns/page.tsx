import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

const statusStyle: Record<string, string> = {
  DRAFT: "badge-gray", ACTIVE: "badge-green", PAUSED: "badge-gold",
  COMPLETED: "badge-gray", ARCHIVED: "badge-gray",
};
const platformColor: Record<string, string> = { META: "#1877F2", GOOGLE: "#EA4335", TIKTOK: "#69C9D0" };

export default async function AdminCampaigns({ searchParams }: { searchParams: Record<string,string> }) {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;
  const clientId = searchParams.clientId;

  const campaigns = await prisma.campaign.findMany({
    where: { client: { agencyId }, ...(clientId && { clientId }) },
    include: {
      client: { select: { businessName: true, brandColor: true } },
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Campagnes</h1>
          <p className="text-diamond-muted mt-1">{campaigns.length} campagne{campaigns.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-diamond-muted border-b border-diamond-border text-left">
              <th className="px-5 py-4 font-medium">Campagne</th>
              <th className="px-5 py-4 font-medium">Client</th>
              <th className="px-5 py-4 font-medium">Plateforme</th>
              <th className="px-5 py-4 font-medium">Statut</th>
              <th className="px-5 py-4 font-medium">Leads</th>
              <th className="px-5 py-4 font-medium">Dépenses</th>
              <th className="px-5 py-4 font-medium">CPL</th>
              <th className="px-5 py-4 font-medium">Créée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-diamond-border">
            {campaigns.length === 0 && (
              <tr><td colSpan={8} className="text-center py-16 text-diamond-muted">Aucune campagne</td></tr>
            )}
            {campaigns.map(c => {
              const cpl = c.totalLeads > 0 && c.totalSpend > 0
                ? `$${(c.totalSpend / c.totalLeads).toFixed(2)}` : "—";
              return (
                <tr key={c.id} className="hover:bg-diamond-border/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-diamond-text font-medium">{c.name}</p>
                    {c.objective && <p className="text-diamond-muted text-xs">{c.objective}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium" style={{ color: c.client.brandColor }}>
                      {c.client.businessName}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {c.platform
                      ? <span className="text-xs font-semibold px-2 py-1 rounded"
                          style={{ background: platformColor[c.platform] + "25", color: platformColor[c.platform] }}>
                          {c.platform}
                        </span>
                      : <span className="text-diamond-muted">—</span>
                    }
                  </td>
                  <td className="px-5 py-4"><span className={statusStyle[c.status]}>{c.status}</span></td>
                  <td className="px-5 py-4 text-diamond-gold font-semibold">{c._count.leads}</td>
                  <td className="px-5 py-4 text-diamond-text">${c.totalSpend.toFixed(0)}</td>
                  <td className="px-5 py-4 text-emerald-400 font-semibold">{cpl}</td>
                  <td className="px-5 py-4 text-diamond-muted text-xs">
                    {format(new Date(c.createdAt), "d MMM yyyy", { locale: fr })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
