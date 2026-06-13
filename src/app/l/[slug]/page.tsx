import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { LandingPageRenderer } from "@/components/landing-pages/LandingPageRenderer";

interface Props { params: { slug: string }; searchParams: Record<string, string> }

export default async function PublicLandingPage({ params, searchParams }: Props) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: { client: { select: { id: true, businessName: true, brandColor: true, logoUrl: true } } },
  });

  if (!page) notFound();

  // Track page view
  await prisma.landingPage.update({
    where: { id: page.id },
    data: { views: { increment: 1 } },
  });

  const utms = {
    utmSource: searchParams.utm_source,
    utmMedium: searchParams.utm_medium,
    utmCampaign: searchParams.utm_campaign,
    utmContent: searchParams.utm_content,
    utmTerm: searchParams.utm_term,
  };

  return <LandingPageRenderer page={page as any} utms={utms} />;
}

export async function generateMetadata({ params }: Props) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true },
  });
  return { title: page?.title ?? "Landing Page", description: page?.description };
}
