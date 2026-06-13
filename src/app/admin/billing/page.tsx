import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreditCard, CheckCircle, Users, TrendingUp, Star } from "lucide-react";

const PLANS = [
  {
    name: "Starter", price: 297, color: "#857E6A",
    features: ["2 clients", "500 leads/mois", "Landing pages", "Tracking leads", "Email support"],
    maxClients: 2,
  },
  {
    name: "Pro", price: 497, color: "#BD9F50",
    features: ["5 clients", "2000 leads/mois", "IA & Rapports", "Automations", "Support prioritaire"],
    maxClients: 5, popular: true,
  },
  {
    name: "Scale", price: 797, color: "#9A7E3A",
    features: ["15 clients", "Leads illimités", "White label", "SMS", "API Access", "Slack support"],
    maxClients: 15,
  },
  {
    name: "Agence", price: 1497, color: "#18160F",
    features: ["Clients illimités", "Tout inclus", "Onboarding dédié", "SLA 99.9%", "Account manager"],
    maxClients: 999,
  },
];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const [clients, subscriptions] = await Promise.all([
    prisma.client.count({ where: { agencyId } }),
    prisma.subscription.findMany({
      where: { client: { agencyId } },
      include: { plan: true, client: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const revenue = subscriptions
    .filter(s => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.plan.priceMonthly, 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="page-title">Facturation</h1>
        <p className="page-subtitle">Gérez les abonnements de vos clients.</p>
      </div>

      {/* MRR stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">MRR</p>
          <p className="text-2xl font-display font-bold text-diamond-text">${revenue.toLocaleString()}<span className="text-sm text-diamond-muted font-body ml-1">CAD</span></p>
        </div>
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Abonnements actifs</p>
          <p className="text-2xl font-display font-bold text-diamond-text">{subscriptions.filter(s => s.status === "ACTIVE").length}</p>
        </div>
        <div className="card">
          <p className="text-diamond-muted text-xs font-body uppercase tracking-widest mb-1">Clients total</p>
          <p className="text-2xl font-display font-bold text-diamond-text">{clients}</p>
        </div>
      </div>

      {/* Plans */}
      <h2 className="font-display font-semibold text-diamond-text text-lg mb-4">Forfaits disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {PLANS.map(plan => (
          <div key={plan.name} className={`card relative ${plan.popular ? "ring-2 ring-diamond-gold" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge-gold text-[10px] px-3 py-1 flex items-center gap-1">
                  <Star size={9} fill="currentColor" /> Populaire
                </span>
              </div>
            )}
            <p className="font-display font-bold text-diamond-text mb-1">{plan.name}</p>
            <p className="text-2xl font-display font-bold mb-4" style={{ color: plan.color }}>
              ${plan.price}<span className="text-sm text-diamond-muted font-body">/mois</span>
            </p>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-diamond-muted font-body">
                  <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="text-[10px] text-diamond-muted font-body pt-3 border-t border-diamond-border">
              Max {plan.maxClients === 999 ? "∞" : plan.maxClients} clients
            </div>
          </div>
        ))}
      </div>

      {/* Active subscriptions */}
      <h2 className="font-display font-semibold text-diamond-text text-lg mb-4">Abonnements clients</h2>
      {subscriptions.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard size={32} className="text-diamond-muted mx-auto mb-3 opacity-40" />
          <p className="text-diamond-muted font-body text-sm">Aucun abonnement actif.</p>
          <p className="text-diamond-muted font-body text-xs mt-1">Assignez un forfait à vos clients dans leur profil.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0"><div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-diamond-border">
                <th className="text-left px-5 py-3 text-xs font-body text-diamond-muted tracking-widest uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-body text-diamond-muted tracking-widest uppercase">Forfait</th>
                <th className="text-left px-5 py-3 text-xs font-body text-diamond-muted tracking-widest uppercase">Prix</th>
                <th className="text-left px-5 py-3 text-xs font-body text-diamond-muted tracking-widest uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-body text-diamond-muted tracking-widest uppercase">Renouvellement</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id} className="border-b border-diamond-border last:border-0 hover:bg-diamond-raised transition-colors">
                  <td className="px-5 py-3 text-sm font-body text-diamond-text">{sub.client.businessName}</td>
                  <td className="px-5 py-3 text-sm font-body text-diamond-text">{sub.plan.name}</td>
                  <td className="px-5 py-3 text-sm font-body text-diamond-gold font-medium">${sub.plan.priceMonthly}/mois</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${sub.status === "ACTIVE" ? "badge-green" : sub.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-200" : "badge"}`}>
                      {sub.status === "ACTIVE" ? "Actif" : sub.status === "CANCELLED" ? "Annulé" : sub.status === "TRIALING" ? "Essai" : sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-body text-diamond-muted">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("fr-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Stripe note */}
      <div className="mt-6 bg-diamond-gold-bg border border-diamond-gold/20 rounded-2xl p-5">
        <p className="text-sm font-body text-diamond-muted">
          <span className="font-semibold text-diamond-text">Intégration Stripe</span> — Pour activer la facturation automatique,
          ajoutez votre clé <code className="text-xs bg-diamond-raised px-1.5 py-0.5 rounded font-mono">STRIPE_SECRET_KEY</code> dans les variables Railway.
          Les abonnements seront créés automatiquement à l'ajout de chaque client.
        </p>
      </div>
    </div>
  );
}
