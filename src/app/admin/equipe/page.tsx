"use client";
import { useState, useEffect } from "react";
import { UserPlus, Copy, Check, Users } from "lucide-react";

type Member = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string };

export default function EquipePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "";

  useEffect(() => {
    fetch("/api/admin/invite").then(r => r.json()).then(setMembers);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "ok", text: `Accès créé pour ${form.name} !` });
      setForm({ name: "", email: "", password: "" });
      fetch("/api/admin/invite").then(r => r.json()).then(setMembers);
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    }
    setSaving(false);
  }

  function copyCredentials() {
    const text = `Accès Diamond Creation CRM\nURL : ${loginUrl}\nEmail : ${form.email}\nMot de passe : ${form.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="page-title">Équipe & Accès</h1>
        <p className="page-subtitle">Gérez les accès à votre CRM — partenaires, collaborateurs.</p>
      </div>

      {/* Current members */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-diamond-gold" />
          <h2 className="font-display font-semibold text-diamond-text">Membres actifs</h2>
        </div>
        <div className="divide-y divide-diamond-border">
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-diamond-raised flex items-center justify-center text-xs font-bold text-diamond-text">
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-diamond-text">{m.name}</p>
                  <p className="text-xs text-diamond-muted font-body">{m.email}</p>
                </div>
              </div>
              <span className="badge-gold">{m.role === "SUPER_ADMIN" ? "Admin" : m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create new access */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus size={16} className="text-diamond-gold" />
          <h2 className="font-display font-semibold text-diamond-text">Créer un accès invité</h2>
        </div>

        {msg && (
          <div className={`text-sm rounded-xl px-4 py-3 mb-4 font-body ${msg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nom complet</label>
              <input className="input" placeholder="Jean Tremblay" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="jean@exemple.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Mot de passe temporaire</label>
            <input className="input" placeholder="Min. 8 caractères" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
          </div>

          <div className="bg-diamond-bg rounded-xl p-4 text-sm font-body text-diamond-muted">
            <p className="font-semibold text-diamond-text mb-1">Informations de connexion à partager :</p>
            <p>URL : <span className="font-mono text-diamond-text">{loginUrl}</span></p>
            <p>Email : <span className="font-mono text-diamond-text">{form.email || "—"}</span></p>
            <p>Mot de passe : <span className="font-mono text-diamond-text">{form.password || "—"}</span></p>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="btn-gold px-6 py-2.5 text-xs tracking-widest uppercase disabled:opacity-50 flex-1">
              {saving ? "Création..." : "Créer l'accès"}
            </button>
            {form.email && form.password && (
              <button type="button" onClick={copyCredentials}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-diamond-border text-diamond-text text-sm font-body hover:bg-diamond-raised transition-all">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copié !" : "Copier"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
