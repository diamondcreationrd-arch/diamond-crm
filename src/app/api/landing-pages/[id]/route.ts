import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const page = await prisma.landingPage.update({
    where: { id: params.id },
    data: {
      ...(body.isPublished !== undefined && {
        isPublished: body.isPublished,
        publishedAt: body.isPublished ? new Date() : null,
      }),
      ...(body.content && { content: body.content }),
      ...(body.formFields && { formFields: body.formFields }),
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });
  return NextResponse.json(page);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.landingPage.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
