import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createLead, getLeadsByClient } from "@/lib/leads";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = req.nextUrl;

  const clientId = user.role === "SUPER_ADMIN"
    ? (searchParams.get("clientId") ?? undefined)
    : user.clientId;

  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const leads = await getLeadsByClient(clientId, {
    campaignId: searchParams.get("campaignId") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lead = await createLead({ ...body, source: body.source ?? "MANUAL" });
  return NextResponse.json(lead, { status: 201 });
}
