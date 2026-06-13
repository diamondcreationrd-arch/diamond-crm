import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  createdAt: Date;
  client?: { businessName: string } | null;
  campaign?: { name: string } | null;
}

const sourceLabel: Record<string, string> = {
  LANDING_PAGE: "Landing Page",
  META_LEAD_AD: "Meta",
  GOOGLE_LEAD_FORM: "Google",
  TIKTOK_LEAD_GEN: "TikTok",
  MANUAL: "Manuel",
};

const statusStyle: Record<string, string> = {
  NEW: "badge-gold",
  CONTACTED: "badge-gray",
  QUALIFIED: "badge-green",
  UNQUALIFIED: "badge-red",
  CONVERTED: "badge-green",
  LOST: "badge-red",
};

interface Props { leads: Lead[]; showClient?: boolean; }

export function RecentLeadsTable({ leads, showClient }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-diamond-text">Leads récents</h2>
        <span className="text-diamond-muted text-sm">{leads.length} leads</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-diamond-muted border-b border-diamond-border">
              <th className="pb-3 text-left font-medium">Nom</th>
              {showClient && <th className="pb-3 text-left font-medium">Client</th>}
              <th className="pb-3 text-left font-medium">Source</th>
              <th className="pb-3 text-left font-medium">Campagne</th>
              <th className="pb-3 text-left font-medium">Statut</th>
              <th className="pb-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-diamond-border">
            {leads.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-diamond-muted">Aucun lead pour le moment</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-diamond-border/20 transition-colors">
                <td className="py-3 pr-4">
                  <p className="text-diamond-text font-medium">
                    {lead.firstName || lead.lastName
                      ? `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim()
                      : lead.email ?? "—"}
                  </p>
                  {lead.email && <p className="text-diamond-muted text-xs">{lead.email}</p>}
                </td>
                {showClient && (
                  <td className="py-3 pr-4 text-diamond-muted">{lead.client?.businessName ?? "—"}</td>
                )}
                <td className="py-3 pr-4">
                  <span className="badge-gray">{sourceLabel[lead.source] ?? lead.source}</span>
                </td>
                <td className="py-3 pr-4 text-diamond-muted text-xs">
                  {lead.campaign?.name ?? "—"}
                </td>
                <td className="py-3 pr-4">
                  <span className={statusStyle[lead.status] ?? "badge-gray"}>{lead.status}</span>
                </td>
                <td className="py-3 text-diamond-muted text-xs">
                  {formatDistanceToNow(new Date(lead.createdAt), { locale: fr, addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
