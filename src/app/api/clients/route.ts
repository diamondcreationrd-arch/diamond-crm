import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agencyId = (session.user as any).agencyId;
  const clients = await prisma.client.findMany({
    where: { agencyId },
    include: { _count: { select: { leads: true, campaigns: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId = (session.user as any).agencyId;
  const body = await req.json();
  const { businessName, contactName, contactEmail, contactPhone, brandColor,
          userEmail, userPassword, userName } = body;

  if (!businessName || !contactName || !contactEmail || !userEmail || !userPassword)
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: userEmail } });
  if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });

  const client = await prisma.client.create({
    data: {
      agencyId, businessName, contactName, contactEmail,
      contactPhone: contactPhone || null,
      brandColor: brandColor || "#BD9F50",
    },
  });

  const hashed = await bcrypt.hash(userPassword, 12);
  await prisma.user.create({
    data: { email: userEmail, password: hashed, name: userName || contactName, role: "CLIENT", clientId: client.id },
  });

  await prisma.notificationSetting.create({
    data: { clientId: client.id, emailEnabled: true, emailAddress: contactEmail },
  });

  return NextResponse.json(client, { status: 201 });
}
