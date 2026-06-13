"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

interface FormField { id: string; type: string; label: string; placeholder?: string; required: boolean; }
interface Page {
  id: string;
  title: string;
  description: string | null;
  template: string;
  content: any;
  formFields: any;
  clientId: string;
  client: { businessName: string; brandColor: string; logoUrl?: string };
}

interface Props {
  page: Page;
  utms: Record<string, string | undefined>;
}

export function LandingPageRenderer({ page, utms }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fields: FormField[] = Array.isArray(page.formFields)
    ? page.formFields
    : page.formFields?.fields ?? [];

  const brandColor = page.client.brandColor ?? "#BD9F50";
  const content = page.content ?? {};

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/leads/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: page.clientId,
        landingPageId: page.id,
        source: "LANDING_PAGE",
        firstName: formData.first_name ?? formData.firstName,
        lastName: formData.last_name ?? formData.lastName,
        email: formData.email,
        phone: formData.phone,
        formData,
        ...utms,
      }),
    });

    setLoading(false);
    if (!res.ok) { setError("Une erreur est survenue. Veuillez réessayer."); return; }

    // Track submission
    await fetch(`/api/landing-pages/${page.id}/view`, { method: "POST", body: JSON.stringify({ type: "submission" }) });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: brandColor + "20" }}>
            <CheckCircle style={{ color: brandColor }} size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {content.successTitle ?? "Merci !"}
          </h2>
          <p className="text-gray-400">
            {content.successMessage ?? "Nous vous contacterons très bientôt."}
          </p>
        </div>
      </div>
    );
  }

  // Template: MODERN
  if (page.template === "MODERN" || !page.template) {
    return (
      <div className="min-h-screen" style={{ background: "#0f0f0f" }}>
        {/* Hero */}
        <div className="relative overflow-hidden py-24 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 blur-3xl"
              style={{ background: brandColor }} />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 border"
              style={{ background: brandColor + "15", color: brandColor, borderColor: brandColor + "40" }}>
              {content.badge ?? "Offre exclusive"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {page.title}
            </h1>
            {page.description && (
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">{page.description}</p>
            )}
          </div>
        </div>

        {/* Form section */}
        <div className="max-w-lg mx-auto px-4 pb-24">
          <div className="rounded-2xl p-8 border" style={{ background: "#171510", borderColor: "#2A2518" }}>
            <h2 className="text-xl font-bold text-white mb-2">
              {content.formTitle ?? "Obtenez votre consultation gratuite"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {content.formSubtitle ?? "Remplissez le formulaire et nous vous contacterons sous 24h."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      value={formData[field.id] ?? ""}
                      onChange={(e) => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                      className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors resize-none"
                      style={{ background: "#0f0f0f", border: `1px solid #2A2518` }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] ?? ""}
                      onChange={(e) => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                      className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                      style={{ background: "#0f0f0f", border: `1px solid #2A2518` }}
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all disabled:opacity-50"
                style={{ background: brandColor, color: "#171510" }}>
                {loading ? "Envoi..." : (content.ctaText ?? "Obtenir ma consultation gratuite")}
              </button>

              <p className="text-center text-gray-600 text-xs">
                {content.privacyText ?? "Vos informations sont confidentielles et ne seront jamais partagées."}
              </p>
            </form>
          </div>

          {/* Social proof */}
          {content.socialProof && (
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
              <span>⭐⭐⭐⭐⭐</span>
              <span>{content.socialProof}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-8 text-gray-700 text-xs">
          Propulsé par <span style={{ color: brandColor }}>Diamond Creation</span>
        </div>
      </div>
    );
  }

  // Template: LUXURY (dark, gold accents)
  return (
    <div className="min-h-screen" style={{ background: "#050403" }}>
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="w-px h-16 mx-auto mb-8" style={{ background: `linear-gradient(to bottom, transparent, ${brandColor})` }} />
          <h1 className="text-5xl font-bold mb-6" style={{
            background: `linear-gradient(135deg, #fff 0%, ${brandColor} 50%, #fff 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {page.title}
          </h1>
          {page.description && <p className="text-gray-500 text-lg max-w-2xl mx-auto">{page.description}</p>}
          <div className="w-px h-16 mx-auto mt-8" style={{ background: `linear-gradient(to bottom, ${brandColor}, transparent)` }} />
        </div>

        <div className="max-w-md mx-auto">
          <div className="p-4 md:p-8 rounded-2xl" style={{
            background: "#0a0906",
            border: `1px solid ${brandColor}30`,
            boxShadow: `0 0 60px ${brandColor}10`,
          }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: brandColor }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full px-4 py-3 text-white text-sm focus:outline-none rounded-lg"
                    style={{ background: "#050403", border: `1px solid ${brandColor}25` }}
                  />
                </div>
              ))}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all disabled:opacity-50 mt-2"
                style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`, color: "#050403" }}>
                {loading ? "..." : (content.ctaText ?? "Commencer maintenant")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
