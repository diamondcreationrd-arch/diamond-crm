import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const headersList = headers();
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] ?? req.ip;
  const userAgent = headersList.get("user-agent") ?? undefined;

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const lead = await createLead({
    ...body,
    ipAddress,
    userAgent,
    source: "LANDING_PAGE",
  });

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
}
