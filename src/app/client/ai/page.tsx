import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClientAIClient } from "@/components/ai/ClientAIClient";

export default async function ClientAIPage() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;

  const [leads, campaigns] = await Promise.all([
    prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { status: true, source: true, platform: true, isConverted: true, createdAt: true, campaignId: true },
    }),
    prisma.campaign.findMany({
      where: { clientId },
      select: { id: true, name: true, status: true, totalSpend: true, totalLeads: true, platform: true },
    }),
  ]);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="page-title">IA & Rapports</h1>
        <p className="page-subtitle">Analyse intelligente de vos performances marketing.</p>
      </div>
      <ClientAIClient leads={leads as any} campaigns={campaigns as any} clientId={clientId} />
    </div>
  );
}
