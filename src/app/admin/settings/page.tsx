import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;
  const user = session!.user as any;
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-diamond-text text-2xl tracking-wide">Paramètres</h1>
        <p className="text-diamond-muted mt-1 font-body text-sm">Configuration de Diamond Creation CRM</p>
      </div>

      <div className="space-y-6">
        {/* Agency info */}
        <div className="card">
          <h2 className="font-display font-semibold text-diamond-text mb-4 tracking-wide">Informations agence</h2>
          <div className="space-y-3 text-sm font-body">
            {[["Agence", agency?.name], ["Admin", user.name], ["Email", user.email]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 border-b border-diamond-border last:border-0">
                <span className="text-diamond-muted">{k}</span>
                <span className="text-diamond-text">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change password */}
        <ChangePasswordForm />

        {/* Webhook URLs */}
        <div className="card">
          <h2 className="font-display font-semibold text-diamond-text mb-4 tracking-wide">URLs Webhooks</h2>
          <p className="text-diamond-muted text-sm mb-4 font-body">
            Configurez ces URLs dans vos comptes publicitaires pour recevoir les leads automatiquement.
          </p>
          {[
            ["Meta / Instagram Lead Ads", "/api/webhooks/meta"],
            ["TikTok Lead Generation", "/api/webhooks/tiktok"],
            ["Google Lead Form Extensions", "/api/webhooks/google"],
          ].map(([label, path]) => (
            <div key={path as string} className="mb-3">
              <p className="text-diamond-muted text-xs mb-1 font-body">{label}</p>
              <code className="block bg-diamond-black border border-diamond-border rounded-lg px-3 py-2 text-diamond-gold text-xs font-mono break-all">
                https://diamond-crm-production.up.railway.app{path}
              </code>
            </div>
          ))}
        </div>

        {/* API Keys */}
        <div className="card">
          <h2 className="font-display font-semibold text-diamond-text mb-4 tracking-wide">Variables d'environnement</h2>
          <div className="space-y-2">
            {[
              ["RESEND_API_KEY", "Email notifications — resend.com"],
              ["TWILIO_ACCOUNT_SID", "SMS notifications — twilio.com"],
              ["TWILIO_AUTH_TOKEN", "SMS notifications — twilio.com"],
              ["TWILIO_PHONE_NUMBER", "Numéro d'envoi SMS"],
              ["META_APP_SECRET", "Vérification webhooks Meta"],
              ["TIKTOK_APP_SECRET", "Signature webhooks TikTok"],
              ["STRIPE_SECRET_KEY", "Paiements & abonnements"],
              ["STRIPE_WEBHOOK_SECRET", "Webhooks Stripe"],
            ].map(([key, desc]) => (
              <div key={key as string} className="flex items-start gap-3 py-2 border-b border-diamond-border last:border-0">
                <code className="text-diamond-gold text-xs font-mono w-48 shrink-0">{key}</code>
                <span className="text-diamond-muted text-xs font-body">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
