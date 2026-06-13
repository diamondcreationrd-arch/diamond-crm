"use client";
import { useState } from "react";
import { Sparkles, RefreshCw, TrendingUp, Users, Target, Zap } from "lucide-react";

export default function AIInsightsPage() {
  const [clientId, setClientId] = useState("");
  const [report, setReport] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!clientId) { setError("Entrez un ID client"); return; }
    setLoading(true); setError(""); setReport("");
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setReport(json.report);
      setData(json.data);
    } catch (_) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  function formatReport(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="font-display font-bold text-diamond-gold mt-5 mb-2 first:mt-0">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.startsWith("•")) {
        return <p key={i} className="text-diamond-muted text-sm pl-3 border-l border-diamond-gold/30 py-0.5">{line.slice(1).trim()}</p>;
      }
      if (line.trim()) return <p key={i} className="text-diamond-text text-sm">{line}</p>;
      return null;
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-diamond-gold/15 flex items-center justify-center">
          <Sparkles size={20} className="text-diamond-gold" />
        </div>
        <div>
          <h1 className="page-title">IA — Insights & Rapports</h1>
          <p className="text-diamond-muted text-sm font-body mt-0.5">Analyse automatique propulsée par Claude AI</p>
        </div>
      </div>

      {/* Generate */}
      <div className="card mb-6">
        <h2 className="font-display font-semibold text-diamond-text mb-4">Générer un rapport client</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="ID du client (cuid)"
            className="input flex-1"
          />
          <button onClick={generate} disabled={loading}
            className="btn-gold flex items-center gap-2 px-5 whitespace-nowrap disabled:opacity-50">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {loading ? "Analyse..." : "Analyser"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Leads total", value: data.leads, icon: Users },
            { label: "Ce mois", value: data.recentLeads, icon: Target },
            { label: "Conversion", value: `${data.conversionRate}%`, icon: TrendingUp },
            { label: "Campagnes", value: data.campaigns, icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card flex items-center gap-3 p-4">
              <Icon size={18} className="text-diamond-gold shrink-0" />
              <div>
                <p className="text-xl font-display font-bold text-diamond-text">{value}</p>
                <p className="text-diamond-muted text-xs font-body">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Report */}
      {report && (
        <div className="card border-diamond-gold/20">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-diamond-border">
            <Sparkles size={15} className="text-diamond-gold" />
            <span className="text-diamond-gold text-sm font-semibold font-body">Rapport généré par IA</span>
          </div>
          <div className="space-y-1.5">{formatReport(report)}</div>
        </div>
      )}

      {!report && !loading && (
        <div className="card border-dashed border-diamond-border/50 flex flex-col items-center justify-center py-16 text-center">
          <Sparkles size={40} className="text-diamond-gold/30 mb-4" />
          <p className="text-diamond-muted font-body text-sm">Entrez un ID client pour générer un rapport d'analyse complet</p>
          <p className="text-diamond-muted/60 font-body text-xs mt-1">Leads, campagnes, taux de conversion, recommandations IA</p>
        </div>
      )}
    </div>
  );
}
