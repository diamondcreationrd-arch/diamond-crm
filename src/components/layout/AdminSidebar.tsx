"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Target, FileText, Globe, Settings, LogOut, TrendingUp, Bell
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Target },
  { href: "/admin/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col bg-diamond-surface border-r border-diamond-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-diamond-border">
        <div className="w-8 h-8 bg-diamond-gold diamond-logo flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="#171510" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Diamond Creation</p>
          <p className="text-diamond-gold text-xs mt-0.5">Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-diamond-gold/15 text-diamond-gold font-medium"
                  : "text-diamond-muted hover:text-white hover:bg-diamond-border/50"
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-diamond-border">
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-diamond-muted hover:text-red-400 hover:bg-red-900/20 transition-all w-full">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
