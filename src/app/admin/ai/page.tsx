import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AIAgentsClient } from "@/components/ai/AIAgentsClient";

export default async function AdminAIPage() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const [clients, totalLeads, totalCampaigns] = await Promise.all([
    prisma.client.findMany({ where: { agencyId }, select: { id: true, businessName: true } }),
    prisma.lead.count({ where: { client: { agencyId } } }),
    prisma.campaign.count({ where: { client: { agencyId } } }),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="page-title">IA & Agents</h1>
        <p className="page-subtitle">Assistants intelligents spécialisés pour faire croître votre agence.</p>
      </div>
      <AIAgentsClient clients={clients} totalLeads={totalLeads} totalCampaigns={totalCampaigns} agencyId={agencyId} />
    </div>
  );
}
