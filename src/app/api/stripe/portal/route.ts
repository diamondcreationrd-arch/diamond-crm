import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  let clientId = user.clientId;

  if (user.role === "SUPER_ADMIN") {
    const body = await req.json();
    clientId = body.clientId;
  }

  if (!clientId) return NextResponse.json({ error: "clientId requis" }, { status: 400 });

  const subscription = await prisma.subscription.findUnique({ where: { clientId } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe trouvé" }, { status: 404 });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/client/settings`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
