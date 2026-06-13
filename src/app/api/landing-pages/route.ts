import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const clientId = user.role === "SUPER_ADMIN"
    ? req.nextUrl.searchParams.get("clientId")
    : user.clientId;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const pages = await prisma.landingPage.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const body = await req.json();
  const clientId = user.role === "SUPER_ADMIN" ? body.clientId : user.clientId;

  const shortId = uuidv4().replace(/-/g, "").slice(0, 6);
  const slug = body.slug ?? `${body.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${shortId}`;

  const page = await prisma.landingPage.create({
    data: {
      clientId,
      name: body.name,
      slug,
      title: body.title,
      description: body.description,
      template: body.template ?? "MODERN",
      content: body.content ?? {},
      formFields: body.formFields ?? { fields: [
        { id: "first_name", type: "text", label: "Prénom", placeholder: "Votre prénom", required: true },
        { id: "last_name", type: "text", label: "Nom", placeholder: "Votre nom", required: true },
        { id: "email", type: "email", label: "Email", placeholder: "vous@exemple.com", required: true },
        { id: "phone", type: "tel", label: "Téléphone", placeholder: "+1 514...", required: false },
      ]},
    },
  });
  return NextResponse.json(page, { status: 201 });
}
