import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CLIENT") redirect("/login");

  const user = session.user as any;

  return (
    <div className="flex h-screen overflow-hidden bg-diamond-bg">
      <ClientSidebar clientName={user.clientName} brandColor={user.clientColor} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
