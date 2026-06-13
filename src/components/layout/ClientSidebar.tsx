"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Target, TrendingUp, Globe, Settings, LogOut } from "lucide-react";

const nav = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/leads", label: "Mes Leads", icon: Target },
  { href: "/client/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/client/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/client/settings", label: "Paramètres", icon: Settings },
];

interface Props { clientName: string; brandColor?: string; }

export function ClientSidebar({ clientName, brandColor = "#BD9F50" }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col bg-diamond-surface border-r border-diamond-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-diamond-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: brandColor + "30", border: `1px solid ${brandColor}50` }}>
          <span style={{ color: brandColor }} className="text-sm font-bold">
            {clientName?.charAt(0) || "C"}
          </span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none truncate max-w-[120px]">{clientName}</p>
          <p className="text-diamond-muted text-xs mt-0.5">Mon portail</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/client" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active ? "text-white font-medium" : "text-diamond-muted hover:text-white hover:bg-diamond-border/50"
              }`}
              style={active ? { background: brandColor + "20", color: brandColor } : {}}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-diamond-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-diamond-muted text-xs">Propulsé par</p>
          <p className="text-diamond-gold text-xs font-semibold">Diamond Creation</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-diamond-muted hover:text-red-400 hover:bg-red-900/20 transition-all w-full">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
