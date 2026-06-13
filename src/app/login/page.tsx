"use client";
import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiamondLogo } from "@/components/DiamondLogo";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <rect width="8.5" height="8.5" fill="#F25022"/><rect x="9.5" width="8.5" height="8.5" fill="#7FBA00"/>
      <rect y="9.5" width="8.5" height="8.5" fill="#00A4EF"/><rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any>({});

  useEffect(() => {
    getProviders().then(p => setProviders(p ?? {}));
    if (params?.get("error") === "OAuthAccountNotLinked")
      setError("Aucun compte lié à cet email. Contactez Diamond Creation.");
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email: email.toLowerCase(), password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Email ou mot de passe incorrect."); return; }
    router.push("/"); router.refresh();
  }

  const hasGoogle = "google" in providers;
  const hasMicrosoft = "azure-ad" in providers;

  return (
    <div className="min-h-screen flex bg-diamond-bg">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-diamond-text flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <DiamondLogo size={32} color="#BD9F50" />
          <span className="font-display font-bold text-white tracking-[0.06em] text-sm uppercase">Diamond Creation</span>
        </div>
        <div>
          <p className="font-display font-bold text-white leading-tight mb-4" style={{ fontSize: "2.2rem" }}>
            La plateforme qui propulse vos clients.
          </p>
          <p className="text-white/50 font-body text-sm leading-relaxed">
            Leads, campagnes, rapports IA et automations — tout ce qu'il faut pour gérer et faire croître votre agence.
          </p>
          <div className="flex items-center gap-2 mt-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-white/40 text-xs font-body">Essai gratuit 30 jours · Aucune carte requise</span>
          </div>
        </div>
        <p className="text-white/20 text-xs font-body">© {new Date().getFullYear()} Diamond Creation</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <DiamondLogo size={28} color="#BD9F50" />
            <span className="font-display font-bold text-diamond-text tracking-[0.06em] text-sm uppercase">Diamond Creation</span>
          </div>

          <h2 className="font-display font-bold text-diamond-text mb-1" style={{ fontSize: "1.6rem" }}>Connexion</h2>
          <p className="text-diamond-muted text-sm font-body mb-8">Accédez à votre portail</p>

          {/* Social */}
          {(hasGoogle || hasMicrosoft) && (
            <div className="space-y-2.5 mb-6">
              {hasGoogle && (
                <button onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-diamond-border bg-white hover:bg-diamond-raised text-diamond-text text-sm font-body transition-all shadow-card hover:shadow-card-hover">
                  <GoogleIcon /> Continuer avec Google
                </button>
              )}
              {hasMicrosoft && (
                <button onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
                  className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-diamond-border bg-white hover:bg-diamond-raised text-diamond-text text-sm font-body transition-all shadow-card hover:shadow-card-hover">
                  <MicrosoftIcon /> Continuer avec Microsoft
                </button>
              )}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-diamond-border" />
                <span className="text-diamond-muted text-xs font-body">ou</span>
                <div className="flex-1 h-px bg-diamond-border" />
              </div>
            </div>
          )}

          {/* Email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" className="input" required autoComplete="email" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input" required autoComplete="current-password" />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-body">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 text-sm tracking-widest uppercase disabled:opacity-50 mt-2">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-diamond-muted text-xs font-body mt-8">
            Pas encore de compte ?{" "}
            <a href="/pricing" className="text-diamond-gold hover:text-diamond-gold-dark underline underline-offset-2">Voir les forfaits</a>
          </p>
        </div>
      </div>
    </div>
  );
}
