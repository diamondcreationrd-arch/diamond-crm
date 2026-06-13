import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Meta sends a GET request to verify the webhook
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Meta sends a POST with lead data
export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify signature
  const sig = req.headers.get("x-hub-signature-256");
  const expected = "sha256=" + crypto
    .createHmac("sha256", process.env.META_APP_SECRET || "")
    .update(body)
    .digest("hex");

  if (sig !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;

      const { leadgen_id, page_id, form_id, ad_id, campaign_id } = change.value;

      // Find which client owns this ad account
      const adAccount = await prisma.adAccount.findFirst({
        where: { platform: "META", isConnected: true },
        include: { client: true },
      });

      if (!adAccount) continue;

      // Fetch lead data from Meta Graph API
      const leadRes = await fetch(
        `https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${adAccount.accessToken}&fields=field_data,created_time`
      );
      const leadData = await leadRes.json();

      const fields: Record<string, string> = {};
      for (const f of leadData.field_data ?? []) {
        fields[f.name] = f.values?.[0] ?? "";
      }

      await createLead({
        clientId: adAccount.clientId,
        source: "META_LEAD_AD",
        platform: "META",
        platformLeadId: leadgen_id,
        firstName: fields.first_name,
        lastName: fields.last_name,
        email: fields.email,
        phone: fields.phone_number,
        formData: fields,
      });
    }
  }

  return NextResponse.json({ received: true });
}
