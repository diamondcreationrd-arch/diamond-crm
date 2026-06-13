"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (next.length < 8) { setError("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (next !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Erreur lors du changement."); return; }
    setSuccess(true);
    setCurrent(""); setNext(""); setConfirm("");
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-diamond-gold/10 flex items-center justify-center">
          <Lock size={15} className="text-diamond-gold" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Changer le mot de passe</h2>
          <p className="text-diamond-muted text-xs mt-0.5">Sécurisez votre accès</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-4">
          <CheckCircle size={15} />
          Mot de passe mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Mot de passe actuel</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="input pr-10"
              required
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-diamond-muted hover:text-white transition-colors">
              {showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Nouveau mot de passe</label>
          <div className="relative">
            <input
              type={showNext ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min. 8 caractères"
              className="input pr-10"
              required
            />
            <button type="button" onClick={() => setShowNext(!showNext)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-diamond-muted hover:text-white transition-colors">
              {showNext ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {next.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {{[4,6,8,10].map((n: number) => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                  next.length >= n ? "bg-diamond-gold" : "bg-diamond-border"
                }`}/>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={`input ${confirm && confirm !== next ? "border-red-700" : confirm && confirm === next ? "border-emerald-700" : ""}`}
            required
          />
        </div>

        <button type="submit" disabled={loading}
          className="btn-gold w-full py-2.5 text-sm disabled:opacity-50">
          {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}
