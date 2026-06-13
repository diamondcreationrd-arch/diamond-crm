import prisma from "./prisma";
import { sendLeadNotification } from "./notifications";

interface CreateLeadInput {
  clientId: string;
  campaignId?: string;
  landingPageId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  formData?: Record<string, any>;
  source: "LANDING_PAGE" | "META_LEAD_AD" | "GOOGLE_LEAD_FORM" | "TIKTOK_LEAD_GEN" | "MANUAL";
  platform?: "META" | "GOOGLE" | "TIKTOK";
  platformLeadId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
}

export async function createLead(input: CreateLeadInput) {
  // Prevent duplicate platform leads
  if (input.platformLeadId) {
    const existing = await prisma.lead.findFirst({
      where: { platformLeadId: input.platformLeadId },
    });
    if (existing) return existing;
  }

  const lead = await prisma.lead.create({ data: input });

  // Update campaign lead count
  if (input.campaignId) {
    await prisma.campaign.update({
      where: { id: input.campaignId },
      data: { totalLeads: { increment: 1 } },
    });
  }

  // Send notification to client
  await sendLeadNotification(lead.clientId, lead);

  return lead;
}

export async function getLeadsByClient(clientId: string, filters?: {
  campaignId?: string;
  source?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  return prisma.lead.findMany({
    where: {
      clientId,
      ...(filters?.campaignId && { campaignId: filters.campaignId }),
      ...(filters?.source && { source: filters.source as any }),
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.dateFrom && { createdAt: { gte: filters.dateFrom } }),
    },
    include: { campaign: true, landingPage: true },
    orderBy: { createdAt: "desc" },
  });
}

export function calculateCPL(totalSpend: number, totalLeads: number): number | null {
  if (totalLeads === 0 || totalSpend === 0) return null;
  return totalSpend / totalLeads;
}

export function calculateCPA(totalSpend: number, totalConversions: number): number | null {
  if (totalConversions === 0 || totalSpend === 0) return null;
  return totalSpend / totalConversions;
}
