import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.isQualified !== undefined && { isQualified: body.isQualified }),
      ...(body.isConverted !== undefined && {
        isConverted: body.isConverted,
        convertedAt: body.isConverted ? new Date() : null,
      }),
    },
  });
  return NextResponse.json(lead);
}
