import prisma from "./prisma";

interface Lead {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  source: string;
  platform?: string | null;
}

const sourceLabel: Record<string, string> = {
  LANDING_PAGE: "Landing Page",
  META_LEAD_AD: "Meta Ads",
  GOOGLE_LEAD_FORM: "Google Ads",
  TIKTOK_LEAD_GEN: "TikTok Ads",
  MANUAL: "Manuel",
};

export async function sendLeadNotification(clientId: string, lead: Lead) {
  const settings = await prisma.notificationSetting.findUnique({ where: { clientId } });
  if (!settings || (!settings.notifyOnNewLead)) return;

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email || "Nouveau lead";
  const source = sourceLabel[lead.source] ?? lead.source;

  const promises: Promise<any>[] = [];

  if (settings.emailEnabled && settings.emailAddress) {
    promises.push(sendEmailNotification(settings.emailAddress, name, source, lead));
  }

  if (settings.smsEnabled && settings.phoneNumber) {
    promises.push(sendSMSNotification(settings.phoneNumber, name, source, lead));
  }

  await Promise.allSettled(promises);
}

async function sendEmailNotification(to: string, leadName: string, source: string, lead: Lead) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Diamond Creation CRM <notifications@diamondcreation.ca>",
    to,
    subject: `🔔 Nouveau lead — ${leadName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #171510; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #BD9F50, #9A7E3A); padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #171510; font-size: 20px; font-weight: 700;">💎 Diamond Creation CRM</h1>
          <p style="margin: 8px 0 0; color: #171510; opacity: 0.8; font-size: 14px;">Nouveau lead reçu</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #BD9F50; font-size: 18px; margin: 0 0 20px;">${leadName}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #2A2518;">
              <td style="padding: 10px 0; color: #6B6550; font-size: 13px; width: 40%;">Source</td>
              <td style="padding: 10px 0; color: #fff; font-size: 13px;">${source}</td>
            </tr>
            ${lead.email ? `<tr style="border-bottom: 1px solid #2A2518;"><td style="padding: 10px 0; color: #6B6550; font-size: 13px;">Email</td><td style="padding: 10px 0; color: #fff; font-size: 13px;">${lead.email}</td></tr>` : ""}
            ${lead.phone ? `<tr style="border-bottom: 1px solid #2A2518;"><td style="padding: 10px 0; color: #6B6550; font-size: 13px;">Téléphone</td><td style="padding: 10px 0; color: #fff; font-size: 13px;">${lead.phone}</td></tr>` : ""}
          </table>
          <div style="margin-top: 28px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/client/leads" 
               style="display: inline-block; background: #BD9F50; color: #171510; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Voir le lead →
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #6B6550; font-size: 11px; border-top: 1px solid #2A2518;">
          Diamond Creation CRM · Propulsé par IA
        </div>
      </div>
    `,
  });
}

async function sendSMSNotification(to: string, leadName: string, source: string, lead: Lead) {
  const twilio = require("twilio");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const details = [
    lead.email && `Email: ${lead.email}`,
    lead.phone && `Tél: ${lead.phone}`,
  ].filter(Boolean).join(" | ");

  await client.messages.create({
    body: `💎 Nouveau lead!\n${leadName}\nSource: ${source}\n${details}\n\nVoir: ${process.env.NEXTAUTH_URL}/client/leads`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}
