"use client";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Filter, Download, Search, ChevronDown } from "lucide-react";

const SOURCES = ["Toutes", "LANDING_PAGE", "META_LEAD_AD", "GOOGLE_LEAD_FORM", "TIKTOK_LEAD_GEN", "MANUAL"];
const STATUSES = ["Tous", "NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED", "LOST"];
const PLATFORMS = ["Tous", "META", "GOOGLE", "TIKTOK"];

const sourceLabel: Record<string, string> = {
  LANDING_PAGE: "Landing Page", META_LEAD_AD: "Meta", GOOGLE_LEAD_FORM: "Google",
  TIKTOK_LEAD_GEN: "TikTok", MANUAL: "Manuel",
};
const statusStyle: Record<string, string> = {
  NEW: "badge-gold", CONTACTED: "badge-gray", QUALIFIED: "badge-green",
  UNQUALIFIED: "badge-red", CONVERTED: "badge-green", LOST: "badge-red",
};
const statusFr: Record<string, string> = {
  NEW: "Nouveau", CONTACTED: "Contacté", QUALIFIED: "Qualifié",
  UNQUALIFIED: "Non qualifié", CONVERTED: "Converti", LOST: "Perdu",
};

interface Lead {
  id: string; firstName?: string; lastName?: string; email?: string; phone?: string;
  source: string; platform?: string; status: string; createdAt: string;
  client?: { businessName: string }; campaign?: { name: string }; landingPage?: { name: string };
  utmCampaign?: string; utmSource?: string;
}

interface Props { leads: Lead[]; clients?: { id: string; businessName: string }[]; isAdmin?: boolean; }

export function LeadsPageClient({ leads, clients = [], isAdmin }: Props) {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("Toutes");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || [l.firstName, l.lastName, l.email, l.phone].some(v => v?.toLowerCase().includes(q));
    const matchSource = filterSource === "Toutes" || l.source === filterSource;
    const matchStatus = filterStatus === "Tous" || l.status === filterStatus;
    return matchSearch && matchSource && matchStatus;
  }), [leads, search, filterSource, filterStatus]);

  function exportCSV() {
    const rows = [
      ["Prénom", "Nom", "Email", "Téléphone", "Source", "Statut", "Campagne", "Date"],
      ...filtered.map(l => [
        l.firstName ?? "", l.lastName ?? "", l.email ?? "", l.phone ?? "",
        sourceLabel[l.source] ?? l.source, statusFr[l.status] ?? l.status,
        l.campaign?.name ?? "", format(new Date(l.createdAt), "dd/MM/yyyy HH:mm"),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Leads</h1>
          <p className="text-diamond-muted mt-1">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2 text-sm">
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-diamond-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un lead..." className="input pl-9" />
        </div>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="input w-auto pr-8">
          {SOURCES.map(s => <option key={s} value={s}>{s === "Toutes" ? "Toutes sources" : sourceLabel[s] ?? s}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input w-auto pr-8">
          {STATUSES.map(s => <option key={s} value={s}>{s === "Tous" ? "Tous statuts" : statusFr[s] ?? s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-diamond-muted border-b border-diamond-border text-left">
                <th className="px-5 py-4 font-medium">Lead</th>
                {isAdmin && <th className="px-5 py-4 font-medium">Client</th>}
                <th className="px-5 py-4 font-medium">Source</th>
                <th className="px-5 py-4 font-medium">Campagne</th>
                <th className="px-5 py-4 font-medium">Statut</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-diamond-border">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-diamond-muted">Aucun lead trouvé</td></tr>
              )}
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-diamond-border/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}>
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">
                      {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—"}
                    </p>
                    <p className="text-diamond-muted text-xs">{lead.email ?? lead.phone ?? "—"}</p>
                  </td>
                  {isAdmin && <td className="px-5 py-4 text-diamond-muted text-xs">{lead.client?.businessName ?? "—"}</td>}
                  <td className="px-5 py-4">
                    <span className="badge-gray">{sourceLabel[lead.source] ?? lead.source}</span>
                  </td>
                  <td className="px-5 py-4 text-diamond-muted text-xs">{lead.campaign?.name ?? lead.landingPage?.name ?? "—"}</td>
                  <td className="px-5 py-4">
                    <LeadStatusBadge leadId={lead.id} status={lead.status} />
                  </td>
                  <td className="px-5 py-4 text-diamond-muted text-xs">
                    {format(new Date(lead.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
                  </td>
                  <td className="px-5 py-4 text-diamond-muted">→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead detail drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelectedLead(null)} />
          <div className="w-96 bg-diamond-surface border-l border-diamond-border overflow-y-auto">
            <div className="p-6 border-b border-diamond-border flex items-center justify-between">
              <h2 className="font-semibold text-white">Détail du lead</h2>
              <button onClick={() => setSelectedLead(null)} className="text-diamond-muted hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-diamond-gold font-semibold text-lg">
                  {[selectedLead.firstName, selectedLead.lastName].filter(Boolean).join(" ") || "Anonyme"}
                </p>
                <LeadStatusBadge leadId={selectedLead.id} status={selectedLead.status} editable />
              </div>
              {[
                ["Email", selectedLead.email],
                ["Téléphone", selectedLead.phone],
                ["Source", sourceLabel[selectedLead.source]],
                ["Campagne", selectedLead.campaign?.name],
                ["Landing page", selectedLead.landingPage?.name],
                ["UTM Campaign", selectedLead.utmCampaign],
                ["UTM Source", selectedLead.utmSource],
                ["Date", format(new Date(selectedLead.createdAt), "d MMMM yyyy, HH:mm", { locale: fr })],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="border-b border-diamond-border pb-3">
                  <p className="text-diamond-muted text-xs mb-1">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadStatusBadge({ leadId, status, editable }: { leadId: string; status: string; editable?: boolean }) {
  const [current, setCurrent] = useState(status);

  async function updateStatus(newStatus: string) {
    setCurrent(newStatus);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  if (!editable) return <span className={statusStyle[current] ?? "badge-gray"}>{statusFr[current] ?? current}</span>;

  return (
    <div className="relative group inline-block">
      <button className={`${statusStyle[current] ?? "badge-gray"} flex items-center gap-1`}>
        {statusFr[current] ?? current} <ChevronDown size={10} />
      </button>
      <div className="absolute left-0 top-full mt-1 bg-diamond-surface border border-diamond-border rounded-lg overflow-hidden z-10 hidden group-hover:block min-w-[140px]">
        {STATUSES.filter(s => s !== "Tous").map(s => (
          <button key={s} onClick={() => updateStatus(s)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-diamond-border/50 text-white transition-colors">
            {statusFr[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
