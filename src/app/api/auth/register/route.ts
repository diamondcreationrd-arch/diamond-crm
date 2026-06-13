import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, businessName } = await req.json();

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Find Diamond Creation agency
    const agency = await prisma.agency.findFirst();
    if (!agency) {
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    // Create client record
    const client = await prisma.client.create({
      data: {
        businessName,
        contactName: name,
        contactEmail: email,
        agencyId: agency.id,
      },
    });

    // Create user linked to client
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "CLIENT",
        clientId: client.id,
        agencyId: agency.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
