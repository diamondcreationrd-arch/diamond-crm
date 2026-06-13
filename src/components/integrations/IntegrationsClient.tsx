"use client";
import { useState } from "react";

type AdAccount = {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  isConnected: boolean;
  tokenExpiry: string | null;
};

const PLATFORMS = [
  {
    key: "META",
    name: "Meta Ads",
    desc: "Facebook & Instagram",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: "GOOGLE",
    name: "Google Ads",
    desc: "Search, Display & YouTube",
    color: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    key: "TIKTOK",
    name: "TikTok Ads",
    desc: "TikTok for Business",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.83 1.55V6.78a4.85 4.85 0 01-1.06-.09z"/>
      </svg>
    ),
  },
];

export function IntegrationsClient({ adAccounts, clientId }: { adAccounts: AdAccount[]; clientId: string }) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ accountId: "", accountName: "", accessToken: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const getAccount = (platform: string) => adAccounts.find(a => a.platform === platform);

  async function saveManual(platform: string) {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/client/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "ok", text: `${platform} connecté avec succès !` });
      setManualMode(null);
      setFormData({ accountId: "", accountName: "", accessToken: "" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    }
    setSaving(false);
  }

  async function disconnect(platform: string) {
    if (!confirm("Déconnecter ce compte ?")) return;
    await fetch("/api/client/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`text-sm rounded-xl px-4 py-3 font-body ${msg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {PLATFORMS.map(platform => {
        const account = getAccount(platform.key);
        const isManual = manualMode === platform.key;

        return (
          <div key={platform.key} className="card">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-diamond-bg border border-diamond-border flex items-center justify-center shrink-0">
                {platform.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-diamond-text">{platform.name}</p>
                  {account?.isConnected && (
                    <span className="badge-green">Connecté</span>
                  )}
                </div>
                <p className="text-diamond-muted text-sm font-body">{platform.desc}</p>
                {account && (
                  <p className="text-diamond-muted text-xs font-body mt-0.5">
                    Compte : {account.accountName} ({account.accountId})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {account ? (
                  <button onClick={() => disconnect(platform.key)}
                    className="px-4 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-body transition-all">
                    Déconnecter
                  </button>
                ) : (
                  <button onClick={() => setManualMode(isManual ? null : platform.key)}
                    className="btn-gold px-4 py-2 text-xs tracking-widest uppercase">
                    {isManual ? "Annuler" : "Connecter"}
                  </button>
                )}
              </div>
            </div>

            {isManual && (
              <div className="mt-5 pt-5 border-t border-diamond-border space-y-3">
                <p className="text-sm font-body text-diamond-muted mb-3">
                  Entrez les informations de votre compte {platform.name}. Vous pouvez trouver ces informations dans le Business Manager ou le Gestionnaire de publicités.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">ID du compte</label>
                    <input className="input" placeholder="ex: act_123456789" value={formData.accountId}
                      onChange={e => setFormData(p => ({ ...p, accountId: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Nom du compte</label>
                    <input className="input" placeholder="ex: Mon entreprise" value={formData.accountName}
                      onChange={e => setFormData(p => ({ ...p, accountName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Token d'accès</label>
                  <input className="input font-mono text-xs" placeholder="Token API de la plateforme" value={formData.accessToken}
                    onChange={e => setFormData(p => ({ ...p, accessToken: e.target.value }))} />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => saveManual(platform.key)} disabled={saving || !formData.accountId || !formData.accountName}
                    className="btn-gold px-6 py-2 text-xs tracking-widest uppercase disabled:opacity-50">
                    {saving ? "Connexion..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-diamond-gold-bg border border-diamond-gold/20 rounded-2xl p-5">
        <p className="text-sm font-body text-diamond-muted">
          <span className="font-semibold text-diamond-text">Comment obtenir votre token d'accès ?</span><br />
          <strong>Meta :</strong> Business Manager → Paramètres → Accès système → Générer un token.<br />
          <strong>Google Ads :</strong> console.cloud.google.com → API Credentials → OAuth 2.0.<br />
          <strong>TikTok :</strong> ads.tiktok.com → Assets → Outils → API Marketing.
        </p>
      </div>
    </div>
  );
}
