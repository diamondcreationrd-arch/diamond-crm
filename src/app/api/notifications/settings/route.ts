import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const body = await req.json();
  const clientId = user.role === "SUPER_ADMIN" ? body.clientId : user.clientId;

  const settings = await prisma.notificationSetting.upsert({
    where: { clientId },
    update: {
      emailEnabled: body.emailEnabled, emailAddress: body.emailAddress,
      smsEnabled: body.smsEnabled, phoneNumber: body.phoneNumber,
      notifyOnNewLead: body.notifyOnNewLead, notifyOnConversion: body.notifyOnConversion,
    },
    create: {
      clientId, emailEnabled: body.emailEnabled, emailAddress: body.emailAddress,
      smsEnabled: body.smsEnabled, phoneNumber: body.phoneNumber,
      notifyOnNewLead: body.notifyOnNewLead, notifyOnConversion: body.notifyOnConversion,
    },
  });
  return NextResponse.json(settings);
}
