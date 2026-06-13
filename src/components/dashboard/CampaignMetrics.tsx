import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalSpend: number;
  totalLeads: number;
  platform: string | null;
  _count: { leads: number };
}

const platformColor: Record<string, string> = {
  META: "#1877F2",
  GOOGLE: "#EA4335",
  TIKTOK: "#69C9D0",
};

const platformLabel: Record<string, string> = {
  META: "Meta",
  GOOGLE: "Google",
  TIKTOK: "TikTok",
};

export function CampaignMetrics({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-diamond-text">Campagnes</h2>
        <Link href="/client/campaigns" className="text-diamond-gold text-sm hover:underline">Voir tout</Link>
      </div>
      <div className="space-y-3">
        {campaigns.length === 0 && (
          <p className="text-diamond-muted text-sm text-center py-4">Aucune campagne</p>
        )}
        {campaigns.map((c) => {
          const cpl = c.totalLeads > 0 && c.totalSpend > 0
            ? `$${(c.totalSpend / c.totalLeads).toFixed(2)}`
            : "—";
          return (
            <div key={c.id} className="p-3 rounded-lg bg-diamond-black border border-diamond-border">
              <div className="flex items-center gap-2 mb-2">
                {c.platform && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: platformColor[c.platform] + "25", color: platformColor[c.platform] }}>
                    {platformLabel[c.platform]}
                  </span>
                )}
                <p className="text-white text-sm font-medium truncate flex-1">{c.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-diamond-gold font-semibold text-sm">{c._count.leads}</p>
                  <p className="text-diamond-muted text-xs">Leads</p>
                </div>
                <div>
                  <p className="text-diamond-text font-semibold text-sm">${c.totalSpend.toFixed(0)}</p>
                  <p className="text-diamond-muted text-xs">Dépensé</p>
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">{cpl}</p>
                  <p className="text-diamond-muted text-xs">CPL</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
