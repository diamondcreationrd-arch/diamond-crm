"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Target, TrendingUp, Globe, Settings, LogOut, CreditCard } from "lucide-react";
import { DiamondLogo } from "@/components/DiamondLogo";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Target },
  { href: "/admin/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/admin/billing", label: "Facturation", icon: CreditCard },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col bg-diamond-surface border-r border-diamond-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-diamond-border">
        <DiamondLogo size={32} />
        <div>
          <p className="font-display font-bold text-white text-xs tracking-widest uppercase leading-tight">Diamond Creation</p>
          <p className="text-diamond-gold text-xs mt-0.5 font-body">Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/admin/billing" && href !== "/admin/settings" && pathname.startsWith(href));
          const exactActive = (href === "/admin" || href === "/admin/billing" || href === "/admin/settings") ? pathname === href : active;
          const isActive = href === "/admin" ? pathname === "/admin" : pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-body ${
                isActive
                  ? "bg-diamond-gold/15 text-diamond-gold font-medium"
                  : "text-diamond-muted hover:text-white hover:bg-diamond-border/50"
              }`}>
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-diamond-border">
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-diamond-muted hover:text-red-400 hover:bg-red-900/20 transition-all w-full font-body">
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
