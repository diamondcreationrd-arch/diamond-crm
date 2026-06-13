import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Verify token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.GOOGLE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const { lead_id, user_column_data, campaign_id, customer_id } = payload;

  const fields: Record<string, string> = {};
  for (const col of user_column_data ?? []) {
    fields[col.column_name] = col.string_value ?? "";
  }

  const adAccount = await prisma.adAccount.findFirst({
    where: { platform: "GOOGLE", isConnected: true },
  });

  if (!adAccount) return NextResponse.json({ received: true });

  await createLead({
    clientId: adAccount.clientId,
    source: "GOOGLE_LEAD_FORM",
    platform: "GOOGLE",
    platformLeadId: lead_id,
    firstName: fields.FIRST_NAME,
    lastName: fields.LAST_NAME,
    email: fields.EMAIL,
    phone: fields.PHONE_NUMBER,
    formData: fields,
  });

  return NextResponse.json({ received: true });
}
