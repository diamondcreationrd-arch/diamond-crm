import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadsPageClient } from "@/components/leads/LeadsPageClient";

export default async function ClientLeads({ searchParams }: { searchParams: Record<string, string> }) {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;

  const leads = await prisma.lead.findMany({
    where: {
      clientId,
      ...(searchParams.source && { source: searchParams.source as any }),
      ...(searchParams.status && { status: searchParams.status as any }),
    },
    include: { campaign: true, landingPage: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <LeadsPageClient leads={leads as any} isAdmin={false} />;
}
