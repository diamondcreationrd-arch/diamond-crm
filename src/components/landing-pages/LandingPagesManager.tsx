"use client";
import { useState } from "react";
import { Globe, Eye, ExternalLink, Plus, Copy, CheckCircle, Trash2 } from "lucide-react";

interface LandingPage {
  id: string; name: string; slug: string; title: string;
  template: string; isPublished: boolean; views: number; submissions: number;
  createdAt: string;
}

interface Props {
  pages: LandingPage[];
  clientId: string;
  baseUrl: string;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

const TEMPLATES = [
  { id: "MODERN", name: "Modern", desc: "Dark avec accent coloré, haute conversion" },
  { id: "LUXURY", name: "Luxury", desc: "Élégant, gradient or, premium" },
];

const DEFAULT_FIELDS = [
  { id: "first_name", type: "text", label: "Prénom", placeholder: "Votre prénom", required: true },
  { id: "last_name", type: "text", label: "Nom", placeholder: "Votre nom de famille", required: true },
  { id: "email", type: "email", label: "Email", placeholder: "vous@exemple.com", required: true },
  { id: "phone", type: "tel", label: "Téléphone", placeholder: "+1 514...", required: false },
];

export function LandingPagesManager({ pages: initialPages, clientId, baseUrl, isAdmin }: Props) {
  const [pages, setPages] = useState(initialPages);
  const [showBuilder, setShowBuilder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", title: "", description: "", template: "MODERN",
    ctaText: "Obtenir ma consultation gratuite",
    formTitle: "Obtenez votre consultation gratuite",
    badge: "Offre exclusive",
    successTitle: "Merci !",
    successMessage: "Nous vous contacterons très bientôt.",
  });

  function setF(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleCreate() {
    if (!form.name || !form.title) return;
    setSaving(true);
    const res = await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        name: form.name,
        title: form.title,
        description: form.description,
        template: form.template,
        content: {
          badge: form.badge,
          formTitle: form.formTitle,
          ctaText: form.ctaText,
          successTitle: form.successTitle,
          successMessage: form.successMessage,
        },
        formFields: { fields: DEFAULT_FIELDS },
      }),
    });
    const page = await res.json();
    setPages(p => [page, ...p]);
    setSaving(false);
    setShowBuilder(false);
    setForm({ name: "", title: "", description: "", template: "MODERN",
      ctaText: "Obtenir ma consultation gratuite", formTitle: "Obtenez votre consultation gratuite",
      badge: "Offre exclusive", successTitle: "Merci !", successMessage: "Nous vous contacterons très bientôt." });
  }

  async function togglePublish(page: LandingPage) {
    await fetch(`/api/landing-pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    setPages(ps => ps.map(p => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
  }

  async function deletePage(id: string) {
    if (!confirm("Supprimer cette landing page ?")) return;
    await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    setPages(ps => ps.filter(p => p.id !== id));
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${baseUrl}/l/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-diamond-text">Landing Pages</h1>
          <p className="text-diamond-muted mt-1">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Nouvelle landing page
        </button>
      </div>

      {/* Pages grid */}
      <div className="grid grid-cols-1 gap-4">
        {pages.length === 0 && !showBuilder && (
          <div className="card text-center py-16">
            <Globe size={40} className="text-diamond-muted mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Aucune landing page</p>
            <p className="text-diamond-muted text-sm mb-6">Créez une page pour capturer des leads</p>
            <button onClick={() => setShowBuilder(true)} className="btn-gold inline-flex items-center gap-2">
              <Plus size={16} /> Créer ma première page
            </button>
          </div>
        )}

        {pages.map((page: any) => (
          <div key={page.id} className="card flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-diamond-black border border-diamond-border flex items-center justify-center shrink-0">
              <Globe size={20} className="text-diamond-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold">{page.name}</p>
                <span className={page.isPublished ? "badge-green" : "badge-gray"}>
                  {page.isPublished ? "Live" : "Draft"}
                </span>
                <span className="badge-gray">{page.template}</span>
              </div>
              <p className="text-diamond-muted text-sm truncate">{page.title}</p>
              <p className="text-diamond-muted text-xs mt-1">
                {page.views} vues · {page.submissions} soumissions
                {page.views > 0 && page.submissions > 0 &&
                  ` · ${((page.submissions / page.views) * 100).toFixed(1)}% conv.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => copyLink(page.slug)}
                className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5">
                {copied === page.slug ? <><CheckCircle size={12} className="text-emerald-400" /> Copié!</> : <><Copy size={12} /> Lien</>}
              </button>
              <a href={`/l/${page.slug}`} target="_blank"
                className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5">
                <ExternalLink size={12} /> Preview
              </a>
              <button onClick={() => togglePublish(page)}
                className={`py-1.5 px-3 text-xs rounded-lg font-medium transition-all ${
                  page.isPublished
                    ? "bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50"
                    : "btn-gold"
                }`}>
                {page.isPublished ? "Dépublier" : "Publier"}
              </button>
              <button onClick={() => deletePage(page.id)}
                className="p-2 text-diamond-muted hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Builder modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-diamond-surface border border-diamond-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-diamond-border">
              <h2 className="font-semibold text-white text-lg">Nouvelle landing page</h2>
              <button onClick={() => setShowBuilder(false)} className="text-diamond-muted hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Template */}
              <div>
                <label className="label">Template *</label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} type="button" onClick={() => setF("template", t.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.template === t.id
                          ? "border-diamond-gold bg-diamond-gold/10"
                          : "border-diamond-border hover:border-diamond-gold/40"
                      }`}>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-diamond-muted text-xs mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Nom interne *</label>
                <input className="input" value={form.name} onChange={e => setF("name", e.target.value)}
                  placeholder="Campagne été 2025" />
              </div>
              <div>
                <label className="label">Titre principal *</label>
                <input className="input" value={form.title} onChange={e => setF("title", e.target.value)}
                  placeholder="Obtenez 30% plus de clients en 60 jours" />
              </div>
              <div>
                <label className="label">Description (sous-titre)</label>
                <input className="input" value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="Une ligne qui renforce la promesse" />
              </div>
              <div>
                <label className="label">Badge / accroche</label>
                <input className="input" value={form.badge} onChange={e => setF("badge", e.target.value)} />
              </div>
              <div>
                <label className="label">Titre du formulaire</label>
                <input className="input" value={form.formTitle} onChange={e => setF("formTitle", e.target.value)} />
              </div>
              <div>
                <label className="label">Texte du bouton CTA</label>
                <input className="input" value={form.ctaText} onChange={e => setF("ctaText", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Titre confirmation</label>
                  <input className="input" value={form.successTitle} onChange={e => setF("successTitle", e.target.value)} />
                </div>
                <div>
                  <label className="label">Message confirmation</label>
                  <input className="input" value={form.successMessage} onChange={e => setF("successMessage", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowBuilder(false)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={handleCreate} disabled={saving || !form.name || !form.title}
                  className="btn-gold flex-1 py-3 disabled:opacity-50">
                  {saving ? "Création..." : "Créer la page"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
