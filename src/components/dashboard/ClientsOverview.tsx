import Link from "next/link";
import { Users } from "lucide-react";

interface Client {
  id: string;
  businessName: string;
  brandColor: string;
  isActive: boolean;
  _count: { leads: number; campaigns: number };
  leads: { id: string }[];
}

export function ClientsOverview({ clients }: { clients: Client[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-diamond-text">Clients</h2>
        <Link href="/admin/clients" className="text-diamond-gold text-sm hover:underline">
          Voir tous
        </Link>
      </div>
      <div className="space-y-3">
        {clients.length === 0 && (
          <p className="text-diamond-muted text-sm text-center py-4">Aucun client</p>
        )}
        {clients.map((client) => (
          <Link key={client.id} href={`/admin/clients/${client.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-diamond-black hover:bg-diamond-border/30 transition-all group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: client.brandColor + "25", border: `1px solid ${client.brandColor}40` }}>
              <span style={{ color: client.brandColor }} className="text-sm font-bold">
                {client.businessName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{client.businessName}</p>
              <p className="text-diamond-muted text-xs">
                {client.leads.length} leads ce mois · {client._count.campaigns} campagnes
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${client.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
          </Link>
        ))}
      </div>
      <Link href="/admin/clients/new"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-diamond-border rounded-lg text-diamond-muted hover:border-diamond-gold hover:text-diamond-gold transition-all text-sm">
        + Ajouter un client
      </Link>
    </div>
  );
}
