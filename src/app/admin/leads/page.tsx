import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadsPageClient } from "@/components/leads/LeadsPageClient";

export default async function AdminLeads({ searchParams }: { searchParams: Record<string, string> }) {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const clientId = searchParams.clientId;
  const source = searchParams.source;
  const status = searchParams.status;
  const platform = searchParams.platform;

  const [leads, clients] = await Promise.all([
    prisma.lead.findMany({
      where: {
        client: { agencyId },
        ...(clientId && { clientId }),
        ...(source && { source: source as any }),
        ...(status && { status: status as any }),
        ...(platform && { platform: platform as any }),
      },
      include: { client: true, campaign: true, landingPage: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.client.findMany({ where: { agencyId }, select: { id: true, businessName: true } }),
  ]);

  return <LeadsPageClient leads={leads as any} clients={clients} isAdmin />;
}
