"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DiamondLogo } from "@/components/DiamondLogo";

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
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-diamond-gold/4 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-5">
            <DiamondLogo size={56} />
          </div>
          <h1 className="font-display font-bold text-white tracking-display" style={{ fontSize: "1.6rem", letterSpacing: "0.04em" }}>
            DIAMOND CREATION
          </h1>
          <p className="text-diamond-muted text-xs mt-2 tracking-widest uppercase font-body">
            CRM — Portail de connexion
          </p>
        </div>

        {/* Card */}
        <div className="card space-y-5">
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
              className="btn-gold w-full py-3 text-sm tracking-widest uppercase font-body font-semibold disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-diamond-muted text-xs mt-6 font-body">
          © {new Date().getFullYear()} Diamond Creation. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
