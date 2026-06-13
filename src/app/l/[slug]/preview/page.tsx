import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LandingPageRenderer } from "@/components/landing-pages/LandingPageRenderer";

interface Props { params: { slug: string } }

export default async function PreviewLandingPage({ params }: Props) {
  // Must be authenticated to preview unpublished pages
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = await prisma.landingPage.findUnique({
    where: { slug: params.slug }, // No isPublished filter
    include: { client: { select: { id: true, businessName: true, brandColor: true, logoUrl: true } } },
  });

  if (!page) notFound();

  return (
    <div>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center text-xs font-bold py-1.5 tracking-widest uppercase">
        ⚠ MODE PRÉVISUALISATION — Cette page n'est pas publiée
      </div>
      <div className="pt-7">
        <LandingPageRenderer page={page as any} utms={{}} />
      </div>
    </div>
  );
}
