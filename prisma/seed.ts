import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Diamond Creation agency
  const agency = await prisma.agency.upsert({
    where: { id: "diamond-creation" },
    update: {},
    create: { id: "diamond-creation", name: "Diamond Creation" },
  });

  // Create super admin
  const hashedPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@diamondcreation.ca" },
    update: {},
    create: {
      email: "admin@diamondcreation.ca",
      password: hashedPassword,
      name: "Spartacus",
      role: "SUPER_ADMIN",
      agencyId: agency.id,
    },
  });

  // Create demo client
  const client = await prisma.client.create({
    data: {
      agencyId: agency.id,
      businessName: "Restaurant Le Prestige",
      contactName: "Marie Dupont",
      contactEmail: "marie@leprestige.ca",
      contactPhone: "+1 514 555-0100",
      brandColor: "#C41E3A",
    },
  });

  // Create client user
  const clientPassword = await bcrypt.hash("client123!", 12);
  await prisma.user.create({
    data: {
      email: "marie@leprestige.ca",
      password: clientPassword,
      name: "Marie Dupont",
      role: "CLIENT",
      clientId: client.id,
    },
  });

  // Create client notification settings
  await prisma.notificationSetting.create({
    data: {
      clientId: client.id,
      emailEnabled: true,
      emailAddress: "marie@leprestige.ca",
      smsEnabled: false,
    },
  });

  console.log("✅ Seed completed");
  console.log("   Admin: admin@diamondcreation.ca / admin123!");
  console.log("   Client: marie@leprestige.ca / client123!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
