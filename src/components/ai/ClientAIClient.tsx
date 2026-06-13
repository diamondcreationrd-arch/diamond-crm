"use client";
import { useState } from "react";
import { Sparkles, TrendingUp, Target, BarChart3, Loader2, RefreshCw } from "lucide-react";

interface Props { leads: any[]; campaigns: any[]; clientId: string; }

export function ClientAIClient({ leads, campaigns, clientId }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Compute quick stats
  const totalLeads = leads.length;
  const converted = leads.filter(l => l.isConverted).length;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : "0";
  const totalSpend = campaigns.reduce((s, c) => s + (c.totalSpend ?? 0), 0);
  const cpl = totalLeads > 0 && totalSpend > 0 ? (totalSpend / totalLeads).toFixed(2) : "N/A";

  // Source breakdown
  const bySource: Record<string, number> = {};
  leads.forEach(l => { bySource[l.source] = (bySource[l.source] ?? 0) + 1; });

  const SOURCE_LABELS: Record<string, string> = {
    LANDING_PAGE: "Landing Page",
    META_LEAD_AD: "Meta Ads",
    GOOGLE_LEAD_FORM: "Google Ads",
    TIKTOK_LEAD_GEN: "TikTok Ads",
    MANUAL: "Manuel",
  };

  async function generateReport() {
    setLoading(true); setError(""); setReport(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setReport(data.insights ?? data.report ?? JSON.stringify(data));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Leads total", value: totalLeads, icon: Target, color: "text-diamond-gold" },
          { label: "Convertis", value: converted, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Taux de conversion", value: `${convRate}%`, icon: BarChart3, color: "text-blue-600" },
          { label: "CPL moyen", value: totalSpend > 0 ? `$${cpl}` : "N/A", icon: Sparkles, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} strokeWidth={1.8} />
              <p className="text-diamond-muted text-xs font-body uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-xl font-display font-bold text-diamond-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Source breakdown */}
      {Object.keys(bySource).length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-diamond-text mb-4">Sources de leads</h2>
          <div className="space-y-2.5">
            {Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
              <div key={src}>
                <div className="flex justify-between text-xs font-body mb-1">
                  <span className="text-diamond-text">{SOURCE_LABELS[src] ?? src}</span>
                  <span className="text-diamond-muted">{count} leads ({totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="h-1.5 bg-diamond-raised rounded-full overflow-hidden">
                  <div className="h-full bg-diamond-gold rounded-full transition-all"
                    style={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-diamond-text mb-4">Campagnes</h2>
          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-diamond-border last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-body text-diamond-text">{c.name}</p>
                  <p className="text-xs text-diamond-muted font-body">{c.platform ?? "—"} · {c.status}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-bold text-diamond-text">{c.totalLeads} leads</p>
                  <p className="text-xs text-diamond-muted font-body">${c.totalSpend?.toFixed(0) ?? 0} dépensé</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Report */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-diamond-text">Rapport IA</h2>
            <p className="text-xs text-diamond-muted font-body mt-0.5">Analyse automatique de vos données marketing</p>
          </div>
          <button onClick={generateReport} disabled={loading}
            className="btn-gold px-4 py-2 text-xs tracking-widest uppercase flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {loading ? "Analyse..." : "Générer"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-body rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {!report && !loading && (
          <div className="text-center py-10">
            <Sparkles size={28} className="text-diamond-muted mx-auto mb-3 opacity-40" />
            <p className="text-diamond-muted font-body text-sm">Cliquez sur "Générer" pour une analyse IA de vos performances.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <Loader2 size={28} className="text-diamond-gold mx-auto mb-3 animate-spin" />
            <p className="text-diamond-muted font-body text-sm">Analyse en cours...</p>
          </div>
        )}

        {report && (
          <div className="bg-diamond-bg rounded-2xl p-5 text-sm font-body text-diamond-text leading-relaxed whitespace-pre-wrap">
            {report}
          </div>
        )}
      </div>
    </div>
  );
}
