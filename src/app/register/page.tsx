"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { DiamondLogo } from "@/components/DiamondLogo";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter — 29$/mois",
  pro: "Pro — 79$/mois",
  scale: "Scale — 149$/mois",
  agence: "Agence — 297$/mois",
};

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const planSlug = params.get("plan") || "starter";
  const planLabel = PLAN_LABELS[planSlug] || planSlug;

  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create account
      const reg = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const regData = await reg.json();
      if (!reg.ok) { setError(regData.error || "Erreur lors de la création du compte"); setLoading(false); return; }

      // 2. Sign in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) { setError("Compte créé mais connexion échouée. Connectez-vous manuellement."); setLoading(false); return; }

      // 3. Stripe checkout
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, email: form.email }),
      });
      const checkoutData = await checkout.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-diamond-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity">
        <DiamondLogo size={28} color="#BD9F50" />
        <span className="font-display font-bold text-diamond-text tracking-[0.06em] text-sm uppercase">Diamond Creation</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Trial banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-emerald-800 text-sm font-body font-semibold">30 jours gratuits inclus</p>
            <p className="text-emerald-700 text-xs font-body">Aucune carte de crédit requise pour commencer</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-diamond-border shadow-card p-8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-diamond-text text-2xl mb-1">Créer votre compte</h1>
            <p className="text-diamond-muted text-sm font-body">
              Plan sélectionné : <span className="text-diamond-gold font-semibold">{planLabel}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-700 text-sm font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-diamond-text mb-1.5">Nom complet</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Jean Tremblay"
                className="w-full border border-diamond-border rounded-xl px-4 py-2.5 text-sm font-body text-diamond-text placeholder:text-diamond-muted focus:outline-none focus:border-diamond-gold focus:ring-1 focus:ring-diamond-gold/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-diamond-text mb-1.5">Nom de l'agence / entreprise</label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={e => setForm(f => ({...f, businessName: e.target.value}))}
                placeholder="Mon Agence Marketing"
                className="w-full border border-diamond-border rounded-xl px-4 py-2.5 text-sm font-body text-diamond-text placeholder:text-diamond-muted focus:outline-none focus:border-diamond-gold focus:ring-1 focus:ring-diamond-gold/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-diamond-text mb-1.5">Adresse courriel</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="jean@monagence.com"
                className="w-full border border-diamond-border rounded-xl px-4 py-2.5 text-sm font-body text-diamond-text placeholder:text-diamond-muted focus:outline-none focus:border-diamond-gold focus:ring-1 focus:ring-diamond-gold/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-diamond-text mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Minimum 8 caractères"
                  className="w-full border border-diamond-border rounded-xl px-4 py-2.5 pr-11 text-sm font-body text-diamond-text placeholder:text-diamond-muted focus:outline-none focus:border-diamond-gold focus:ring-1 focus:ring-diamond-gold/30 transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-diamond-muted hover:text-diamond-text transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-sm font-body font-semibold mt-2 disabled:opacity-60"
            >
              {loading ? "Création du compte..." : "Commencer mon essai gratuit →"}
            </button>
          </form>

          <p className="text-center text-diamond-muted text-xs font-body mt-5">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-diamond-gold hover:underline font-medium">Se connecter</Link>
          </p>
        </div>

        <p className="text-center text-diamond-muted text-xs font-body mt-4">
          En créant un compte, vous acceptez nos conditions d'utilisation. Aucune carte requise pour l'essai.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-diamond-bg flex items-center justify-center"><DiamondLogo size={32} color="#BD9F50" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
