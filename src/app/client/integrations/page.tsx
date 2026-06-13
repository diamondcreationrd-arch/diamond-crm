import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { IntegrationsClient } from "@/components/integrations/IntegrationsClient";

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;

  const adAccounts = await prisma.adAccount.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="page-title">Intégrations</h1>
        <p className="page-subtitle">Connectez vos comptes publicitaires pour voir vos données en temps réel.</p>
      </div>
      <IntegrationsClient adAccounts={adAccounts as any} clientId={clientId} />
    </div>
  );
}
