import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DiamondLogo } from "@/components/DiamondLogo";
import Link from "next/link";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    const role = (session.user as any).role;
    if (role === "SUPER_ADMIN") redirect("/admin");
    redirect("/client");
  }

  return (
    <div className="min-h-screen bg-white font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-diamond-border/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DiamondLogo size={28} color="#BD9F50" />
            <span className="font-display font-bold text-diamond-text tracking-[0.06em] text-sm uppercase">Diamond Creation</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-diamond-muted text-sm hover:text-diamond-text transition-colors">Tarifs</Link>
            <Link href="/login" className="text-diamond-muted text-sm hover:text-diamond-text transition-colors">Connexion</Link>
            <Link href="/pricing" className="btn-gold px-5 py-2 text-xs tracking-widest uppercase">Essai gratuit</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-diamond-gold-bg border border-diamond-gold/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-diamond-gold"></span>
          <span className="text-diamond-gold text-xs font-body font-medium tracking-wide">Conçu par Diamond Creation · Pour Diamond Creation</span>
        </div>
        <h1 className="font-display font-bold text-diamond-text leading-[1.08] mb-6" style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}>
          Le CRM qui donne à<br />vos clients une vision claire.
        </h1>
        <p className="text-diamond-muted text-lg leading-relaxed max-w-2xl mx-auto mb-10 font-body">
          Nous avons créé cette plateforme pour nos clients — pour qu'ils voient exactement où va leur budget,
          combien de leads sont générés, et comment leurs campagnes performent. En temps réel.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/pricing" className="btn-gold px-8 py-3.5 text-sm tracking-widest uppercase">
            Commencer · 30 jours gratuits
          </Link>
          <Link href="/login" className="px-8 py-3.5 rounded-xl border border-diamond-border text-diamond-text text-sm font-body hover:bg-diamond-raised transition-all">
            Se connecter
          </Link>
        </div>
        <p className="text-diamond-muted/60 text-xs font-body mt-4">Aucune carte de crédit requise · Annulez à tout moment</p>
      </section>

      {/* Why we built this */}
      <section className="py-20 px-6 bg-diamond-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-diamond-gold text-xs font-body font-semibold tracking-[0.2em] uppercase mb-3">Notre histoire</p>
            <h2 className="font-display font-bold text-diamond-text text-3xl md:text-4xl mb-4">Pourquoi on a créé ça</h2>
            <p className="text-diamond-muted font-body max-w-2xl mx-auto leading-relaxed">
              On est une agence marketing. Nos clients nous demandaient toujours : "Est-ce que ça marche ?"
              On avait les données, mais pas d'endroit pour les montrer clairement. Alors on a tout construit.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "◈",
                title: "Transparence totale",
                desc: "Vos clients voient leurs leads, leurs campagnes et leurs dépenses en temps réel. Fini les rapports PDF envoyés par email."
              },
              {
                icon: "◇",
                title: "Rapports IA automatiques",
                desc: "Notre IA analyse les données de vos campagnes et génère des recommandations concrètes pour améliorer les résultats."
              },
              {
                icon: "◆",
                title: "Un outil à votre image",
                desc: "Chaque client a son portail avec ses couleurs. Votre marque reste au centre — pas la nôtre."
              }
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-card border border-diamond-border/60">
                <div className="text-diamond-gold text-2xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-diamond-text text-lg mb-2">{f.title}</h3>
                <p className="text-diamond-muted text-sm font-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-diamond-gold text-xs font-body font-semibold tracking-[0.2em] uppercase mb-3">Fonctionnalités</p>
            <h2 className="font-display font-bold text-diamond-text text-3xl md:text-4xl">Tout ce dont vous avez besoin</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["Suivi des leads en temps réel", "Chaque lead capturé, sourcé et qualifié automatiquement."],
              ["Gestion des campagnes pub", "Meta, Google, TikTok — vos dépenses et résultats au même endroit."],
              ["Landing pages intégrées", "Créez des pages de capture sans sortir de la plateforme."],
              ["Rapports IA personnalisés", "Analyse automatique avec recommandations concrètes chaque semaine."],
              ["Automations intelligentes", "Si un lead arrive → notification, email, assignation automatique."],
              ["Portail client blanc", "Vos clients se connectent à leur espace personnalisé avec votre branding."],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl hover:bg-diamond-bg transition-colors">
                <div className="w-6 h-6 rounded-full bg-diamond-gold-bg border border-diamond-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#BD9F50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="font-display font-semibold text-diamond-text text-sm mb-1">{title}</p>
                  <p className="text-diamond-muted text-sm font-body leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-diamond-text">
        <div className="max-w-2xl mx-auto text-center">
          <DiamondLogo size={40} color="#BD9F50" className="mx-auto mb-6" />
          <h2 className="font-display font-bold text-white text-3xl md:text-4xl mb-4">
            Prêt à offrir plus à vos clients ?
          </h2>
          <p className="text-white/50 font-body mb-8 leading-relaxed">
            Rejoignez Diamond Creation CRM et donnez à vos clients une expérience premium.
          </p>
          <Link href="/pricing" className="inline-block bg-diamond-gold hover:bg-diamond-gold-dark text-white font-body font-semibold px-10 py-4 rounded-xl text-sm tracking-widest uppercase transition-colors">
            Voir les forfaits
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-diamond-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-diamond-muted text-xs font-body">
          <span>© {new Date().getFullYear()} Diamond Creation — Tous droits réservés</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-diamond-text transition-colors">Tarifs</Link>
            <Link href="/login" className="hover:text-diamond-text transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
