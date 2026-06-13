import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const clientId = user.role === "SUPER_ADMIN"
    ? req.nextUrl.searchParams.get("clientId")
    : user.clientId;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const rules = await prisma.automationRule.findMany({
    where: { clientId },
    include: { actions: { orderBy: { order: "asc" } }, _count: { select: { logs: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const body = await req.json();
  const clientId = user.role === "SUPER_ADMIN" ? body.clientId : user.clientId;
  const rule = await prisma.automationRule.create({
    data: {
      clientId,
      name: body.name,
      trigger: body.trigger,
      triggerConfig: body.triggerConfig ?? {},
      actions: { create: (body.actions ?? []).map((a: any, i: number) => ({ order: i, type: a.type, config: a.config ?? {}, delayMinutes: a.delayMinutes ?? 0 })) },
    },
    include: { actions: true },
  });
  return NextResponse.json(rule, { status: 201 });
}
