import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, DollarSign, Target } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

const platformColor: Record<string, string> = { META: "#1877F2", GOOGLE: "#EA4335", TIKTOK: "#69C9D0" };
const statusFr: Record<string, string> = {
  DRAFT: "Brouillon", ACTIVE: "Actif", PAUSED: "Pausé", COMPLETED: "Terminé", ARCHIVED: "Archivé"
};
const statusStyle: Record<string, string> = {
  DRAFT: "badge-gray", ACTIVE: "badge-green", PAUSED: "badge-gold",
  COMPLETED: "badge-gray", ARCHIVED: "badge-gray",
};

export default async function ClientCampaigns() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;

  const campaigns = await prisma.campaign.findMany({
    where: { clientId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalSpend = campaigns.reduce((s: number, c: any) => s + c.totalSpend, 0);
  const totalLeads = campaigns.reduce((s: number, c: any) => s + c.totalLeads, 0);
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const cpl = totalLeads > 0 && totalSpend > 0 ? `$${(totalSpend / totalLeads).toFixed(2)}` : "—";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-diamond-text">Mes Campagnes</h1>
        <p className="text-diamond-muted mt-1">{campaigns.length} campagne{campaigns.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Campagnes actives" value={activeCampaigns} icon={TrendingUp} />
        <StatCard title="Total leads" value={totalLeads} icon={Target} />
        <StatCard title="Total dépensé" value={`$${totalSpend.toFixed(0)}`} icon={DollarSign} />
        <StatCard title="Coût / Lead" value={cpl} icon={Target} />
      </div>

      <div className="space-y-4">
        {campaigns.length === 0 && (
          <div className="card text-center py-16">
            <TrendingUp size={40} className="text-diamond-muted mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Aucune campagne</p>
            <p className="text-diamond-muted text-sm">Vos campagnes apparaîtront ici une fois créées par Diamond Creation.</p>
          </div>
        )}

        {campaigns.map((c: any) => {
          const cpl = c.totalLeads > 0 && c.totalSpend > 0
            ? `$${(c.totalSpend / c.totalLeads).toFixed(2)}` : "—";
          const convRate = c.totalLeads > 0 && c.totalConversions > 0
            ? `${((c.totalConversions / c.totalLeads) * 100).toFixed(1)}%` : "—";

          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  {c.platform && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: platformColor[c.platform] + "20", color: platformColor[c.platform] }}>
                      {c.platform.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    {c.objective && <p className="text-diamond-muted text-xs">{c.objective}</p>}
                  </div>
                </div>
                <span className={statusStyle[c.status]}>{statusFr[c.status]}</span>
              </div>

              <div className="grid grid-cols-5 gap-4 text-center">
                {[
                  ["Leads", c._count.leads, "text-diamond-gold"],
                  ["Dépensé", `$${c.totalSpend.toFixed(0)}`, "text-white"],
                  ["CPL", cpl, "text-emerald-400"],
                  ["Conversions", c.totalConversions, "text-diamond-text"],
                  ["Taux conv.", convRate, "text-emerald-400"],
                ].map(([label, value, color]) => (
                  <div key={label as string} className="p-3 bg-diamond-black rounded-lg border border-diamond-border">
                    <p className={`font-bold text-lg ${color}`}>{value}</p>
                    <p className="text-diamond-muted text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {(c.startDate || c.endDate) && (
                <p className="text-diamond-muted text-xs mt-4">
                  {c.startDate && `Début: ${format(new Date(c.startDate), "d MMM yyyy", { locale: fr })}`}
                  {c.startDate && c.endDate && " · "}
                  {c.endDate && `Fin: ${format(new Date(c.endDate), "d MMM yyyy", { locale: fr })}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
