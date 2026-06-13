"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Target, TrendingUp, Globe, Settings, LogOut, CreditCard, Sparkles, Zap } from "lucide-react";
import { DiamondLogo } from "@/components/DiamondLogo";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Target },
  { href: "/admin/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/admin/ai", label: "IA & Rapports", icon: Sparkles },
  { href: "/admin/automations", label: "Automations", icon: Zap },
  { href: "/admin/billing", label: "Facturation", icon: CreditCard },
];

const bottom = [
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-56 flex flex-col bg-diamond-surface border-r border-diamond-border shrink-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-diamond-border">
        <div className="flex items-center gap-2.5">
          <DiamondLogo size={28} color="#BD9F50" />
          <div>
            <p className="font-display font-bold text-diamond-text text-xs tracking-[0.06em] uppercase leading-tight">Diamond Creation</p>
            <p className="text-diamond-gold text-[10px] font-body mt-0.5 tracking-wide">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body transition-all duration-100 ${
                active
                  ? "bg-diamond-gold-bg text-diamond-gold-dark font-medium"
                  : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"
              }`}>
              <Icon size={15} strokeWidth={active ? 2.2 : 1.7} className={active ? "text-diamond-gold" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-diamond-border space-y-0.5">
        {bottom.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body transition-all duration-100 ${
                active ? "bg-diamond-gold-bg text-diamond-gold-dark font-medium" : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"
              }`}>
              <Icon size={15} strokeWidth={1.7} />
              {label}
            </Link>
          );
        })}
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-diamond-muted hover:text-red-600 hover:bg-red-50 transition-all duration-100 w-full font-body">
          <LogOut size={15} strokeWidth={1.7} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
