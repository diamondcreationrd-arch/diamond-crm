"use client";
import { useState } from "react";
import { Zap, Play, Pause, CheckCircle, XCircle, Clock } from "lucide-react";

const TRIGGER_LABELS: Record<string, string> = {
  NEW_LEAD: "Nouveau lead",
  LEAD_STATUS_CHANGED: "Statut lead changé",
  LEAD_FROM_SOURCE: "Lead depuis une source",
  CAMPAIGN_STARTED: "Campagne démarrée",
  DAILY_SUMMARY: "Résumé quotidien",
};

const ACTION_LABELS: Record<string, string> = {
  SEND_EMAIL: "Email",
  SEND_SMS: "SMS",
  UPDATE_LEAD_STATUS: "Changer statut",
  NOTIFY_WEBHOOK: "Webhook",
  WAIT: "Attendre",
  AI_QUALIFY_LEAD: "IA qualification",
};

interface Props {
  automations: any[];
  clients: { id: string; businessName: string }[];
}

export function AutomationsAdminClient({ automations, clients }: Props) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? automations : automations.filter(a => a.clientId === filter);
  const active = automations.filter(a => a.isActive).length;

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    window.location.reload();
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Total</p>
          <p className="text-2xl font-display font-bold text-diamond-text">{automations.length}</p>
        </div>
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Actives</p>
          <p className="text-2xl font-display font-bold text-emerald-600">{active}</p>
        </div>
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Pausées</p>
          <p className="text-2xl font-display font-bold text-diamond-muted">{automations.length - active}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-xl text-sm font-body transition-all ${filter === "all" ? "bg-diamond-gold text-white" : "bg-diamond-raised text-diamond-muted hover:text-diamond-text"}`}>
          Tous
        </button>
        {clients.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-body transition-all ${filter === c.id ? "bg-diamond-gold text-white" : "bg-diamond-raised text-diamond-muted hover:text-diamond-text"}`}>
            {c.businessName}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Zap size={32} className="text-diamond-muted mx-auto mb-3 opacity-40" />
          <p className="text-diamond-muted font-body text-sm">Aucune automation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(auto => (
            <div key={auto.id} className="card">
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${auto.isActive ? "bg-emerald-50" : "bg-diamond-raised"}`}>
                  <Zap size={16} className={auto.isActive ? "text-emerald-600" : "text-diamond-muted"} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-diamond-text text-sm">{auto.name}</p>
                    <span className={`badge text-[10px] ${auto.isActive ? "badge-green" : "bg-diamond-raised text-diamond-muted border-diamond-border"}`}>
                      {auto.isActive ? "Active" : "Pausée"}
                    </span>
                  </div>
                  <p className="text-diamond-muted text-xs font-body mt-0.5">{auto.client?.businessName}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs font-body text-diamond-muted bg-diamond-raised px-2.5 py-1 rounded-lg">
                      Déclencheur : {TRIGGER_LABELS[auto.trigger] ?? auto.trigger}
                    </span>
                    {auto.actions?.map((action: any, i: number) => (
                      <span key={i} className="text-xs font-body text-diamond-muted bg-diamond-raised px-2.5 py-1 rounded-lg">
                        {ACTION_LABELS[action.type] ?? action.type}
                      </span>
                    ))}
                  </div>
                  {auto.logs?.[0] && (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-body ${auto.logs[0].status === "success" ? "text-emerald-600" : "text-red-500"}`}>
                      {auto.logs[0].status === "success" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      Dernière exécution : {new Date(auto.logs[0].createdAt).toLocaleString("fr-CA")}
                    </div>
                  )}
                </div>
                <button onClick={() => toggleActive(auto.id, auto.isActive)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body border transition-all ${auto.isActive ? "border-amber-200 text-amber-600 hover:bg-amber-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}>
                  {auto.isActive ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Activer</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
