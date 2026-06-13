import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { platform, accountId, accountName, accessToken } = await req.json();
  if (!platform || !accountId || !accountName) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  await prisma.adAccount.upsert({
    where: { clientId_platform_accountId: { clientId, platform, accountId } },
    create: { clientId, platform, accountId, accountName, accessToken, isConnected: true },
    update: { accountName, accessToken, isConnected: true },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { platform } = await req.json();

  await prisma.adAccount.updateMany({
    where: { clientId, platform },
    data: { isConnected: false, accessToken: null },
  });

  return NextResponse.json({ success: true });
}
