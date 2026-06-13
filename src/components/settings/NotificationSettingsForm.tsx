"use client";
import { useState } from "react";
import { Bell, Mail, MessageSquare, CheckCircle } from "lucide-react";

interface NotifSettings {
  emailEnabled: boolean; emailAddress?: string;
  smsEnabled: boolean; phoneNumber?: string;
  notifyOnNewLead: boolean; notifyOnConversion: boolean;
}

interface Props { clientId: string; initial?: NotifSettings | null; }

export function NotificationSettingsForm({ clientId, initial }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NotifSettings>({
    emailEnabled: initial?.emailEnabled ?? true,
    emailAddress: initial?.emailAddress ?? "",
    smsEnabled: initial?.smsEnabled ?? false,
    phoneNumber: initial?.phoneNumber ?? "",
    notifyOnNewLead: initial?.notifyOnNewLead ?? true,
    notifyOnConversion: initial?.notifyOnConversion ?? true,
  });

  function set(key: keyof NotifSettings, val: any) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSave() {
    setLoading(true);
    await fetch("/api/notifications/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, ...form }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Bell size={16} className="text-diamond-gold" />
        <h2 className="font-semibold text-white">Notifications leads</h2>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-diamond-muted" />
            <span className="text-white text-sm">Notifications par email</span>
          </div>
          <Toggle checked={form.emailEnabled} onChange={v => set("emailEnabled", v)} />
        </div>
        {form.emailEnabled && (
          <div>
            <label className="label">Email de réception</label>
            <input type="email" value={form.emailAddress ?? ""} onChange={e => set("emailAddress", e.target.value)}
              placeholder="vous@exemple.com" className="input" />
          </div>
        )}
      </div>

      {/* SMS */}
      <div className="space-y-3 pt-4 border-t border-diamond-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-diamond-muted" />
            <span className="text-white text-sm">Notifications par SMS</span>
          </div>
          <Toggle checked={form.smsEnabled} onChange={v => set("smsEnabled", v)} />
        </div>
        {form.smsEnabled && (
          <div>
            <label className="label">Numéro de téléphone</label>
            <input type="tel" value={form.phoneNumber ?? ""} onChange={e => set("phoneNumber", e.target.value)}
              placeholder="+1 514 555-0000" className="input" />
          </div>
        )}
      </div>

      {/* Events */}
      <div className="pt-4 border-t border-diamond-border space-y-3">
        <p className="text-diamond-muted text-xs uppercase tracking-wider">Me notifier quand</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.notifyOnNewLead}
            onChange={e => set("notifyOnNewLead", e.target.checked)}
            className="w-4 h-4 accent-diamond-gold" />
          <span className="text-white text-sm">Nouveau lead reçu</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.notifyOnConversion}
            onChange={e => set("notifyOnConversion", e.target.checked)}
            className="w-4 h-4 accent-diamond-gold" />
          <span className="text-white text-sm">Lead converti</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={loading}
        className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saved ? <><CheckCircle size={16} /> Sauvegardé!</> : loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all relative ${checked ? "bg-diamond-gold" : "bg-diamond-border"}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}
