import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TEMPLATES = [
  {
    name: "Bienvenue nouveau lead",
    trigger: "NEW_LEAD",
    triggerConfig: {},
    actions: [
      { order: 0, type: "SEND_EMAIL", config: { subject: "Merci pour votre intérêt !", message: "Bonjour, merci d'avoir rempli notre formulaire. Un membre de notre équipe vous contactera très bientôt." }, delayMinutes: 0 },
    ],
  },
  {
    name: "Notification équipe — lead qualifié",
    trigger: "LEAD_STATUS_CHANGED",
    triggerConfig: { toStatus: "QUALIFIED" },
    actions: [
      { order: 0, type: "SEND_EMAIL", config: { subject: "Nouveau lead qualifié !", message: "Un lead vient d'être qualifié. Connectez-vous au CRM pour le contacter." }, delayMinutes: 0 },
    ],
  },
  {
    name: "Relance automatique 24h",
    trigger: "NEW_LEAD",
    triggerConfig: {},
    actions: [
      { order: 0, type: "WAIT", config: {}, delayMinutes: 1440 },
      { order: 1, type: "SEND_EMAIL", config: { subject: "On voulait vous recontacter", message: "Bonjour, nous n'avons pas encore eu l'occasion de vous parler. Seriez-vous disponible cette semaine ?" }, delayMinutes: 0 },
    ],
  },
  {
    name: "Résumé quotidien leads",
    trigger: "DAILY_SUMMARY",
    triggerConfig: { hour: 8 },
    actions: [
      { order: 0, type: "SEND_EMAIL", config: { subject: "Résumé du jour", message: "Voici le résumé de vos leads pour la journée." }, delayMinutes: 0 },
    ],
  },
  {
    name: "Qualification IA automatique",
    trigger: "NEW_LEAD",
    triggerConfig: {},
    actions: [
      { order: 0, type: "AI_QUALIFY_LEAD", config: { criteria: "Budget suffisant, besoin urgent, secteur compatible" }, delayMinutes: 0 },
      { order: 1, type: "UPDATE_LEAD_STATUS", config: { status: "QUALIFIED" }, delayMinutes: 0 },
    ],
  },
  {
    name: "Lead Meta Ads — SMS immédiat",
    trigger: "LEAD_FROM_SOURCE",
    triggerConfig: { source: "META_LEAD_AD" },
    actions: [
      { order: 0, type: "SEND_SMS", config: { message: "Nouveau lead Meta reçu. Contactez-le maintenant !" }, delayMinutes: 0 },
    ],
  },
];

export async function GET() {
  return NextResponse.json(TEMPLATES);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateIndex, clientId } = await req.json();
  const agencyId = (session.user as any).agencyId;
  const template = TEMPLATES[templateIndex];
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const client = await prisma.client.findFirst({ where: { id: clientId, agencyId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const rule = await prisma.automationRule.create({
    data: {
      clientId,
      name: template.name,
      trigger: template.trigger as any,
      triggerConfig: template.triggerConfig,
      isActive: true,
      actions: { create: template.actions },
    },
    include: { actions: true },
  });

  return NextResponse.json(rule);
}
