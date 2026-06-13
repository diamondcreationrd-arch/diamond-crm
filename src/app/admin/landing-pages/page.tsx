import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LandingPagesManager } from "@/components/landing-pages/LandingPagesManager";
import { headers } from "next/headers";

export default async function AdminLandingPages({ searchParams }: { searchParams: Record<string, string> }) {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;
  const clientId = searchParams.clientId;

  const [pages, clients] = await Promise.all([
    prisma.landingPage.findMany({
      where: { client: { agencyId }, ...(clientId && { clientId }) },
      include: { client: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ where: { agencyId }, select: { id: true, businessName: true } }),
  ]);

  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  return (
    <LandingPagesManager
      pages={pages as any}
      clientId={clientId ?? clients[0]?.id ?? ""}
      baseUrl={`${proto}://${host}`}
      isAdmin
    />
  );
}
