"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) { setError("Email ou mot de passe incorrect."); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-diamond-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-diamond-gold/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm mx-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-14 h-14 bg-diamond-gold diamond-logo flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L25 10V18L14 25L3 18V10L14 3Z" stroke="#171510" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-wide">Diamond Creation</h1>
          <p className="text-diamond-muted text-sm mt-1">CRM — Portail de connexion</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com" className="input" required autoComplete="email" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="input" required autoComplete="current-password" />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 text-sm tracking-wider uppercase disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
        <p className="text-center text-diamond-muted text-xs mt-6">
          © {new Date().getFullYear()} Diamond Creation. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
