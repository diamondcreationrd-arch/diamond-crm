import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);
  const agencyId = (session!.user as any).agencyId;
  const user = session!.user as any;
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Paramètres agence</h1>
        <p className="text-diamond-muted mt-1">Configuration de Diamond Creation CRM</p>
      </div>

      <div className="space-y-6">
        {/* Agency info */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Informations agence</h2>
          <div className="space-y-3 text-sm">
            {[["Agence", agency?.name], ["Admin", user.name], ["Email", user.email]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 border-b border-diamond-border last:border-0">
                <span className="text-diamond-muted">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Webhook URLs */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">URLs Webhooks</h2>
          <p className="text-diamond-muted text-sm mb-4">
            Configurez ces URLs dans vos comptes publicitaires pour recevoir les leads automatiquement.
          </p>
          {[
            ["Meta / Instagram Lead Ads", "/api/webhooks/meta"],
            ["TikTok Lead Generation", "/api/webhooks/tiktok"],
            ["Google Lead Form Extensions", "/api/webhooks/google"],
          ].map(([label, path]) => (
            <div key={path as string} className="mb-3">
              <p className="text-diamond-muted text-xs mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-diamond-black border border-diamond-border rounded-lg px-3 py-2 text-diamond-gold text-xs font-mono">
                  {process.env.NEXTAUTH_URL ?? "https://votre-domaine.com"}{path}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* API Keys guide */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Variables d'environnement requises</h2>
          <div className="space-y-2">
            {[
              ["RESEND_API_KEY", "Email notifications — resend.com"],
              ["TWILIO_ACCOUNT_SID", "SMS notifications — twilio.com"],
              ["TWILIO_AUTH_TOKEN", "SMS notifications — twilio.com"],
              ["TWILIO_PHONE_NUMBER", "Numéro d'envoi SMS"],
              ["META_APP_SECRET", "Vérification webhooks Meta"],
              ["META_WEBHOOK_VERIFY_TOKEN", "Token vérification Meta"],
              ["TIKTOK_APP_SECRET", "Signature webhooks TikTok"],
              ["GOOGLE_WEBHOOK_SECRET", "Auth webhooks Google"],
            ].map(([key, desc]) => (
              <div key={key as string} className="flex items-start gap-3 py-2 border-b border-diamond-border last:border-0">
                <code className="text-diamond-gold text-xs font-mono w-48 shrink-0">{key}</code>
                <span className="text-diamond-muted text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
