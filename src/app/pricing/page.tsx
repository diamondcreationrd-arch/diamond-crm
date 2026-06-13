import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { DiamondLogo } from "@/components/DiamondLogo";

const plans = [
  {
    name: "Starter",
    price: 29,
    desc: "Pour démarrer et tester la plateforme",
    color: "#6B7280",
    features: [
      "2 clients max",
      "500 leads / mois",
      "1 source publicitaire",
      "Dashboard & tracking",
      "Notifications email",
      "Landing pages (2)",
    ],
    cta: "Commencer gratuitement",
    trial: true,
  },
  {
    name: "Pro",
    price: 79,
    desc: "Pour les agences en croissance",
    color: "#BD9F50",
    features: [
      "10 clients max",
      "Leads illimités",
      "3 sources publicitaires",
      "Dashboard & tracking",
      "Email + SMS",
      "Landing pages illimitées",
      "Rapports IA de base",
      "Automations (5 règles)",
    ],
    cta: "Commencer gratuitement",
    trial: true,
    popular: false,
  },
  {
    name: "Scale",
    price: 149,
    desc: "Pour les agences établies",
    color: "#9A7E3A",
    popular: true,
    features: [
      "25 clients max",
      "Leads illimités",
      "Toutes les sources ads",
      "Rapports IA complets",
      "Automations illimitées",
      "Attribution multi-touch",
      "Support prioritaire",
      "Intégrations webhooks",
    ],
    cta: "Commencer gratuitement",
    trial: true,
  },
  {
    name: "Agence",
    price: 297,
    desc: "Pour les grandes agences & white-label",
    color: "#18160F",
    features: [
      "Clients illimités",
      "Leads illimités",
      "Toutes les sources ads",
      "IA & rapports premium",
      "Automations illimitées",
      "White-label complet",
      "Multi-utilisateurs",
      "Accès API",
      "Account manager dédié",
    ],
    cta: "Commencer gratuitement",
    trial: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-diamond-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-diamond-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <DiamondLogo size={26} color="#BD9F50" />
          <span className="font-display font-bold text-diamond-text tracking-[0.06em] text-sm uppercase">Diamond Creation</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-diamond-muted text-sm hover:text-diamond-text transition-colors font-body">Accueil</Link>
          <Link href="/login" className="btn-gold text-sm px-5 py-2">Se connecter</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-20 px-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-diamond-gold-bg border border-diamond-gold/30 rounded-full px-4 py-1.5 text-diamond-gold-dark text-xs font-body font-medium mb-6">
          <Sparkles size={12} />
          Essai gratuit 30 jours · Aucune carte requise
        </div>
        <h1 className="font-display font-bold text-diamond-text leading-tight mb-4" style={{ fontSize: "3rem" }}>
          Simple, transparent,<br />moins cher que GoHighLevel.
        </h1>
        <p className="text-diamond-muted text-lg font-body">
          Tout ce qu'il faut pour gérer vos clients, tracker vos leads et automatiser votre agence — dès 29$/mois.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-8 pb-24 grid grid-cols-4 gap-5 items-start">
        {plans.map((plan) => (
          <div key={plan.name}
            className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-card-hover ${
              plan.popular ? "border-diamond-gold shadow-gold" : "border-diamond-border shadow-card"
            }`}>
            {plan.popular && (
              <div className="bg-diamond-gold text-white text-xs font-body font-semibold text-center py-1.5 tracking-widest uppercase">
                ⭐ Plus populaire
              </div>
            )}
            <div className="p-6">
              <div className="w-8 h-8 rounded-xl mb-4 flex items-center justify-center" style={{ background: plan.color + "18" }}>
                <Zap size={15} style={{ color: plan.color }} />
              </div>
              <h2 className="font-display font-bold text-diamond-text text-lg mb-1">{plan.name}</h2>
              <p className="text-diamond-muted text-xs font-body mb-5">{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display font-bold text-diamond-text" style={{ fontSize: "2.4rem", lineHeight: 1 }}>{plan.price}$</span>
                <span className="text-diamond-muted text-sm font-body mb-1.5">/mois</span>
              </div>
              {plan.trial && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-5">
                  <p className="text-emerald-700 text-xs font-body text-center font-medium">✓ 30 jours gratuits — aucune carte</p>
                </div>
              )}
              <Link href="/login"
                className={`flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-body font-semibold transition-all mb-6 ${
                  plan.popular
                    ? "bg-diamond-gold text-white hover:bg-diamond-gold-dark shadow-sm"
                    : "border border-diamond-border text-diamond-text hover:border-diamond-gold hover:text-diamond-gold bg-white"
                }`}>
                {plan.cta}
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body text-diamond-text">
                    <Check size={14} className="text-diamond-gold mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* vs GHL */}
      <div className="max-w-3xl mx-auto px-8 pb-24 text-center">
        <p className="text-diamond-muted text-sm font-body">
          GoHighLevel coûte <span className="line-through">97$–297$</span> USD/mois avec des fonctions limitées. Diamond Creation CRM offre plus — en français, conçu pour les agences québécoises — à partir de 29$ CAD.
        </p>
      </div>
    </div>
  );
}
