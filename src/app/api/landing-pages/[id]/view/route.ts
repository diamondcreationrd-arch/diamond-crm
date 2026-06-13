import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.type === "submission") {
      await prisma.landingPage.update({
        where: { id: params.id },
        data: { submissions: { increment: 1 } },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // silently ignore
  }
}
