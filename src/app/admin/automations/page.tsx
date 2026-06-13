import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AutomationsAdminClient } from "@/components/automations/AutomationsAdminClient";

export default async function AdminAutomationsPage() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;

  const [automations, clients] = await Promise.all([
    prisma.automationRule.findMany({
      where: { client: { agencyId } },
      include: { client: { select: { businessName: true } }, actions: true, logs: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ where: { agencyId }, select: { id: true, businessName: true } }),
  ]);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="page-title">Automations</h1>
        <p className="page-subtitle">Vue d'ensemble des automations de tous vos clients.</p>
      </div>
      <AutomationsAdminClient automations={automations as any} clients={clients} />
    </div>
  );
}
