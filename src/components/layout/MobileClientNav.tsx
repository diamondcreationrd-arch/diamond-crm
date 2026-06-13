"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Target, TrendingUp, Globe, Settings, LogOut, Sparkles, Plug, Menu, X } from "lucide-react";
import { DiamondLogo } from "@/components/DiamondLogo";

const nav = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/client/leads", label: "Mes Leads", icon: Target },
  { href: "/client/campaigns", label: "Campagnes", icon: TrendingUp },
  { href: "/client/landing-pages", label: "Landing Pages", icon: Globe },
  { href: "/client/ai", label: "IA & Rapports", icon: Sparkles },
  { href: "/client/integrations", label: "Intégrations", icon: Plug },
];
const bottom = [{ href: "/client/settings", label: "Paramètres", icon: Settings }];

interface Props { clientName: string; }

export function MobileClientNav({ clientName }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-diamond-surface border-b border-diamond-border px-4 h-13 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-diamond-raised transition-colors">
          <Menu size={19} className="text-diamond-text" />
        </button>
        <div className="flex items-center gap-2">
          <DiamondLogo size={22} color="#BD9F50" />
          <span className="font-display font-bold text-diamond-text text-xs tracking-[0.06em] uppercase truncate max-w-[180px]">{clientName}</span>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full bg-diamond-surface shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-diamond-border">
              <div>
                <p className="font-display font-bold text-diamond-text text-xs tracking-[0.06em] uppercase">{clientName}</p>
                <p className="text-diamond-gold text-[10px] font-body tracking-wide">Portail client</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-diamond-raised">
                <X size={17} className="text-diamond-muted" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
              {nav.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${active ? "bg-diamond-gold-bg text-diamond-gold-dark font-medium" : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"}`}>
                    <Icon size={15} strokeWidth={active ? 2.2 : 1.7} className={active ? "text-diamond-gold" : ""} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-2 py-3 border-t border-diamond-border space-y-0.5">
              {bottom.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${isActive(href) ? "bg-diamond-gold-bg text-diamond-gold-dark font-medium" : "text-diamond-muted hover:text-diamond-text hover:bg-diamond-raised"}`}>
                  <Icon size={15} strokeWidth={1.7} />
                  {label}
                </Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-diamond-muted hover:text-red-600 hover:bg-red-50 transition-all w-full font-body">
                <LogOut size={15} strokeWidth={1.7} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
