import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LandingPagesManager } from "@/components/landing-pages/LandingPagesManager";
import { headers } from "next/headers";

export default async function ClientLandingPages() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;

  const pages = await prisma.landingPage.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  return (
    <LandingPagesManager
      pages={pages as any}
      clientId={clientId}
      baseUrl={`${proto}://${host}`}
    />
  );
}
