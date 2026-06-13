import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { MobileClientNav } from "@/components/layout/MobileClientNav";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CLIENT") redirect("/login");

  const user = session.user as any;

  return (
    <div className="flex h-screen overflow-hidden bg-diamond-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <ClientSidebar clientName={user.clientName} brandColor={user.clientColor} />
      </div>
      {/* Mobile header + drawer */}
      <MobileClientNav clientName={user.clientName ?? "Mon espace"} />
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-13 md:pt-0">
        {children}
      </main>
    </div>
  );
}
