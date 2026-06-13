"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Target, TrendingUp, Globe, Settings, LogOut, Sparkles, Plug } from "lucide-react";
import { DiamondLogo } from "@/components/DiamondLogo";

const nav = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/client/leads", label: "Mes Leads", icon: Target },
  { href: "/client/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/client/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/client/ai", label: "IA & Rapports", icon: Sparkles },
  { href: "/client/integrations", label: "Intégrations", icon: Plug },
];

interface Props { clientName: string; brandColor?: string; }

export function ClientSidebar({ clientName, brandColor = "#BD9F50" }: Props) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-56 flex flex-col bg-diamond-surface border-r border-diamond-border shrink-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-diamond-border">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
            style={{ background: brandColor }}>
            {clientName?.charAt(0) || "C"}
          </div>
          <div className="min-w-0">
            <p className="font-body font-semibold text-diamond-text text-xs leading-tight truncate">{clientName}</p>
            <p className="text-diamond-muted text-[10px] mt-0.5">Mon portail</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 pt-2 border-t border-diamond-border">
          <DiamondLogo size={14} color="#BD9F50" />
          <p className="text-diamond-gold text-[10px] font-body tracking-wide">Diamond Creation</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body transition-all duration-100 ${
                active ? "font-medium" : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"
              }`}
              style={active ? { background: brandColor + "15", color: brandColor } : {}}>
              <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-diamond-border space-y-0.5">
        <Link href="/client/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body transition-all ${
            isActive("/client/settings") ? "bg-diamond-raised text-diamond-text font-medium" : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"
          }`}>
          <Settings size={15} strokeWidth={1.7} />
          Paramètres
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-diamond-muted hover:text-red-600 hover:bg-red-50 transition-all w-full font-body">
          <LogOut size={15} strokeWidth={1.7} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
