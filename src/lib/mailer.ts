import nodemailer from "nodemailer";

// Gmail SMTP transporter
export function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  // Fallback: Resend SMTP if configured
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
  }

  // Dev fallback: log only
  return null;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  const transporter = getTransporter();
  const fromAddress = from ?? process.env.GMAIL_USER ?? process.env.RESEND_FROM_EMAIL ?? "noreply@diamondcreation.ca";

  if (!transporter) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    return { success: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `Diamond Creation CRM <${fromAddress}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ""),
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[EMAIL ERROR]", err.message);
    return { success: false, error: err.message };
  }
}

// Email templates
export function newLeadEmail(data: {
  clientName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  source: string;
  campaignName?: string;
  crmUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #F7F5F0; margin: 0; padding: 20px; }
  .container { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E1D8; }
  .header { background: #18160F; padding: 28px 32px; }
  .logo-text { color: #BD9F50; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .body { padding: 32px; }
  .title { font-size: 20px; font-weight: 700; color: #18160F; margin: 0 0 6px; }
  .subtitle { font-size: 14px; color: #857E6A; margin: 0 0 24px; }
  .field { background: #F7F5F0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
  .field-label { font-size: 10px; color: #857E6A; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 3px; }
  .field-value { font-size: 15px; color: #18160F; font-weight: 500; }
  .cta { display: inline-block; background: #BD9F50; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 20px; }
  .footer { padding: 20px 32px; border-top: 1px solid #E5E1D8; font-size: 11px; color: #857E6A; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-text">◆ Diamond Creation CRM</div>
  </div>
  <div class="body">
    <p class="title">Nouveau lead — ${data.clientName}</p>
    <p class="subtitle">Un nouveau lead vient d'être enregistré dans votre CRM.</p>
    <div class="field">
      <div class="field-label">Nom</div>
      <div class="field-value">${data.leadName}</div>
    </div>
    ${data.leadEmail ? `<div class="field"><div class="field-label">Email</div><div class="field-value">${data.leadEmail}</div></div>` : ""}
    ${data.leadPhone ? `<div class="field"><div class="field-label">Téléphone</div><div class="field-value">${data.leadPhone}</div></div>` : ""}
    <div class="field">
      <div class="field-label">Source</div>
      <div class="field-value">${data.source}${data.campaignName ? ` — ${data.campaignName}` : ""}</div>
    </div>
    <a href="${data.crmUrl}" class="cta">Voir le lead dans le CRM →</a>
  </div>
  <div class="footer">Diamond Creation CRM · Ce message est automatique.</div>
</div>
</body>
</html>`;
}
