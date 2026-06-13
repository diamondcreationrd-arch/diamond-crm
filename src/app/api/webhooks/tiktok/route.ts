import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify TikTok signature
  const sig = req.headers.get("x-tiktok-signature");
  const ts = req.headers.get("x-tiktok-timestamp") ?? "";
  const appSecret = process.env.TIKTOK_APP_SECRET ?? "";
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(ts + body)
    .digest("hex");

  if (sig !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const leads = payload.lead_list ?? payload.data?.lead_list ?? [];

  for (const lead of leads) {
    const adAccount = await prisma.adAccount.findFirst({
      where: { platform: "TIKTOK", isConnected: true },
    });
    if (!adAccount) continue;

    const fields: Record<string, string> = {};
    for (const f of lead.answers ?? []) {
      fields[f.field_name] = f.answer ?? "";
    }

    await createLead({
      clientId: adAccount.clientId,
      source: "TIKTOK_LEAD_GEN",
      platform: "TIKTOK",
      platformLeadId: lead.lead_id,
      firstName: fields.first_name,
      lastName: fields.last_name,
      email: fields.email,
      phone: fields.phone_number,
      formData: fields,
    });
  }

  return NextResponse.json({ received: true });
}
