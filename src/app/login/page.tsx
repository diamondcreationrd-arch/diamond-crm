import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginClient } from "@/components/auth/LoginClient";

export default async function LoginPage() {
  // Already logged in → redirect to correct portal
  const session = await getServerSession(authOptions);
  if (session) {
    const role = (session.user as any).role;
    redirect(role === "SUPER_ADMIN" ? "/admin" : "/client");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-diamond-bg" />}>
      <LoginClient />
    </Suspense>
  );
}
