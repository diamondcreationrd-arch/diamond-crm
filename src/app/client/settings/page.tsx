import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default async function ClientSettings() {
  const session = await getServerSession(authOptions);
  const clientId = (session!.user as any).clientId;
  const user = session!.user as any;

  const [client, notifSettings] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.notificationSetting.findUnique({ where: { clientId } }),
  ]);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-2xl tracking-wide">Paramètres</h1>
        <p className="text-diamond-muted mt-1 font-body text-sm">Gérez votre profil et vos préférences</p>
      </div>

      {/* Profile */}
      <div className="card mb-6">
        <h2 className="font-display font-semibold text-white mb-4 tracking-wide">Mon profil</h2>
        <div className="space-y-3 text-sm font-body">
          <div className="flex justify-between py-2 border-b border-diamond-border">
            <span className="text-diamond-muted">Nom</span>
            <span className="text-white">{user.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-diamond-border">
            <span className="text-diamond-muted">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-diamond-muted">Entreprise</span>
            <span className="text-white">{client?.businessName}</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="mb-6">
        <ChangePasswordForm />
      </div>

      {/* Notifications */}
      <NotificationSettingsForm
        clientId={clientId}
        initial={notifSettings as any}
      />
    </div>
  );
}
