"use client";
import { useState } from "react";
import { Zap, Play, Pause, CheckCircle, XCircle, Sparkles, Plus, Mail, MessageSquare, Clock, Bot, Webhook, RefreshCw } from "lucide-react";

const TRIGGER_LABELS: Record<string, string> = {
  NEW_LEAD: "Nouveau lead",
  LEAD_STATUS_CHANGED: "Statut lead changé",
  LEAD_FROM_SOURCE: "Lead depuis une source",
  CAMPAIGN_STARTED: "Campagne démarrée",
  DAILY_SUMMARY: "Résumé quotidien",
};

const ACTION_ICONS: Record<string, any> = {
  SEND_EMAIL: Mail,
  SEND_SMS: MessageSquare,
  UPDATE_LEAD_STATUS: RefreshCw,
  NOTIFY_WEBHOOK: Webhook,
  WAIT: Clock,
  AI_QUALIFY_LEAD: Bot,
};

const ACTION_LABELS: Record<string, string> = {
  SEND_EMAIL: "Email",
  SEND_SMS: "SMS",
  UPDATE_LEAD_STATUS: "Changer statut",
  NOTIFY_WEBHOOK: "Webhook",
  WAIT: "Attendre",
  AI_QUALIFY_LEAD: "IA qualification",
};

const TEMPLATES = [
  { emoji: "👋", name: "Bienvenue nouveau lead", trigger: "Nouveau lead", actions: ["Email de bienvenue"], color: "text-blue-600 bg-blue-50" },
  { emoji: "🏆", name: "Notification lead qualifié", trigger: "Statut changé → Qualifié", actions: ["Email équipe"], color: "text-emerald-600 bg-emerald-50" },
  { emoji: "⏰", name: "Relance automatique 24h", trigger: "Nouveau lead", actions: ["Attendre 24h", "Email relance"], color: "text-amber-600 bg-amber-50" },
  { emoji: "📊", name: "Résumé quotidien", trigger: "Chaque jour à 8h", actions: ["Email rapport"], color: "text-purple-600 bg-purple-50" },
  { emoji: "🤖", name: "Qualification IA auto", trigger: "Nouveau lead", actions: ["IA analyse", "Changer statut"], color: "text-diamond-gold bg-diamond-gold-bg" },
  { emoji: "📱", name: "Lead Meta → SMS immédiat", trigger: "Lead depuis Meta Ads", actions: ["SMS équipe"], color: "text-pink-600 bg-pink-50" },
];

interface Props {
  automations: any[];
  clients: { id: string; businessName: string }[];
}

export function AutomationsAdminClient({ automations, clients }: Props) {
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState<"list" | "templates">("list");
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id ?? "");
  const [adding, setAdding] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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

  async function applyTemplate(index: number) {
    if (!selectedClient) { setMsg({ type: "err", text: "Sélectionnez un client" }); return; }
    setAdding(index);
    setMsg(null);
    try {
      const res = await fetch("/api/automations/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIndex: index, clientId: selectedClient }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "ok", text: `Automation "${TEMPLATES[index].name}" créée avec succès !` });
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    }
    setAdding(null);
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card"><p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Total</p><p className="text-2xl font-display font-bold text-diamond-text">{automations.length}</p></div>
        <div className="card"><p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Actives</p><p className="text-2xl font-display font-bold text-emerald-600">{active}</p></div>
        <div className="card"><p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Pausées</p><p className="text-2xl font-display font-bold text-diamond-muted">{automations.length - active}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-diamond-raised rounded-2xl p-1 mb-5 w-fit">
        {[["list", "Mes automations"], ["templates", "Templates"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-body transition-all ${tab === key ? "bg-white text-diamond-text shadow-card font-medium" : "text-diamond-muted hover:text-diamond-text"}`}>
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`text-sm rounded-xl px-4 py-3 font-body mb-4 ${msg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {tab === "templates" && (
        <div>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <p className="text-sm font-body text-diamond-muted">Appliquer à :</p>
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
              className="input py-1.5 text-sm w-auto">
              {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((tpl, i) => (
              <div key={i} className="card hover:shadow-card-hover transition-shadow">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 ${tpl.color}`}>
                  {tpl.emoji}
                </div>
                <p className="font-display font-semibold text-diamond-text text-sm mb-1">{tpl.name}</p>
                <p className="text-xs text-diamond-muted font-body mb-1">Déclencheur : {tpl.trigger}</p>
                <div className="flex flex-wrap gap-1 mt-2 mb-4">
                  {tpl.actions.map((a, j) => (
                    <span key={j} className="text-[10px] bg-diamond-raised text-diamond-muted px-2 py-0.5 rounded-full font-body">{a}</span>
                  ))}
                </div>
                <button onClick={() => applyTemplate(i)} disabled={adding === i || !selectedClient}
                  className="btn-gold w-full py-1.5 text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {adding === i ? <><Zap size={11} className="animate-pulse" /> Création...</> : <><Plus size={11} /> Ajouter</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "list" && (
        <div>
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

          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <Zap size={32} className="text-diamond-muted mx-auto mb-3 opacity-40" />
              <p className="text-diamond-muted font-body text-sm mb-3">Aucune automation. Commencez avec un template !</p>
              <button onClick={() => setTab("templates")} className="btn-gold px-5 py-2 text-xs tracking-widest uppercase">
                Voir les templates
              </button>
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
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs font-body text-diamond-muted bg-diamond-raised px-2.5 py-1 rounded-lg">
                          {TRIGGER_LABELS[auto.trigger] ?? auto.trigger}
                        </span>
                        {auto.actions?.map((action: any, i: number) => {
                          const Icon = ACTION_ICONS[action.type] ?? Zap;
                          return (
                            <span key={i} className="text-xs font-body text-diamond-muted bg-diamond-raised px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Icon size={10} /> {ACTION_LABELS[action.type] ?? action.type}
                            </span>
                          );
                        })}
                      </div>
                      {auto.logs?.[0] && (
                        <div className={`flex items-center gap-1.5 mt-2 text-xs font-body ${auto.logs[0].status === "success" ? "text-emerald-600" : "text-red-500"}`}>
                          {auto.logs[0].status === "success" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          {new Date(auto.logs[0].createdAt).toLocaleString("fr-CA")}
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
      )}
    </div>
  );
}
