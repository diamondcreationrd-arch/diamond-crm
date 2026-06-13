"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BRAND_COLORS = ["#BD9F50","#C41E3A","#1877F2","#25D366","#FF6B35","#7C3AED","#0EA5E9","#10B981"];

export default function NewClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brandColor, setBrandColor] = useState("#BD9F50");
  const [form, setForm] = useState({
    businessName: "", contactName: "", contactEmail: "", contactPhone: "",
    userEmail: "", userPassword: "", userName: "",
  });

  function set(key: string, val: string) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, brandColor }),
    });

    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
    const client = await res.json();
    router.push(`/admin/clients/${client.id}`);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/clients" className="text-diamond-muted hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Nouveau client</h1>
          <p className="text-diamond-muted mt-0.5">Créer un portail client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-diamond-text mb-2">Informations de l'entreprise</h2>
          <div>
            <label className="label">Nom de l'entreprise *</label>
            <input className="input" required value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="Restaurant Le Prestige" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact — Nom *</label>
              <input className="input" required value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Marie Dupont" />
            </div>
            <div>
              <label className="label">Contact — Téléphone</label>
              <input className="input" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+1 514..." />
            </div>
          </div>
          <div>
            <label className="label">Email de contact *</label>
            <input className="input" type="email" required value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="client@exemple.com" />
          </div>

          {/* Brand color */}
          <div>
            <label className="label">Couleur de marque</label>
            <div className="flex items-center gap-3 flex-wrap">
              {BRAND_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setBrandColor(c)}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{ background: c, outline: brandColor === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-diamond-border" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: brandColor }} />
              <span className="text-diamond-muted text-xs">{brandColor}</span>
            </div>
          </div>
        </div>

        {/* Login credentials */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-diamond-text mb-2">Accès au portail client</h2>
          <div>
            <label className="label">Nom d'utilisateur *</label>
            <input className="input" required value={form.userName} onChange={e => set("userName", e.target.value)} placeholder="Marie Dupont" />
          </div>
          <div>
            <label className="label">Email de connexion *</label>
            <input className="input" type="email" required value={form.userEmail} onChange={e => set("userEmail", e.target.value)} placeholder="marie@exemple.com" />
          </div>
          <div>
            <label className="label">Mot de passe temporaire *</label>
            <input className="input" type="text" required value={form.userPassword} onChange={e => set("userPassword", e.target.value)} placeholder="Minimum 8 caractères" minLength={8} />
            <p className="text-diamond-muted text-xs mt-1">Le client pourra le changer dans ses paramètres</p>
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="flex gap-3">
          <Link href="/admin/clients" className="btn-outline flex-1 text-center py-3">Annuler</Link>
          <button type="submit" disabled={loading} className="btn-gold flex-1 py-3 disabled:opacity-50">
            {loading ? "Création..." : "Créer le portail"}
          </button>
        </div>
      </form>
    </div>
  );
}
