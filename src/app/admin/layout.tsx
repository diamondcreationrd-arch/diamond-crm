import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { MobileAdminNav } from "@/components/layout/MobileAdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-diamond-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      {/* Mobile header + drawer */}
      <MobileAdminNav />
      {/* Main content — top padding on mobile for the fixed header */}
      <main className="flex-1 overflow-y-auto pt-13 md:pt-0">
        {children}
      </main>
    </div>
  );
}
