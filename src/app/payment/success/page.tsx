import Link from "next/link";
import { DiamondLogo } from "@/components/DiamondLogo";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-diamond-bg flex flex-col items-center justify-center px-4">
      <DiamondLogo size={40} color="#BD9F50" />
      <div className="mt-8 text-center max-w-md">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="font-display font-bold text-diamond-text text-3xl mb-3">
          Paiement confirmé !
        </h1>
        <p className="text-diamond-muted font-body mb-2">
          Votre essai gratuit de 30 jours est activé.
        </p>
        <p className="text-diamond-muted font-body text-sm mb-8">
          Notre équipe vous contactera dans les 24h pour configurer votre compte Diamond Creation CRM.
        </p>
        <Link href="/login" className="btn-gold px-8 py-3 text-sm inline-block">
          Accéder à mon compte
        </Link>
      </div>
    </div>
  );
}
