import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";

const PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  scale: process.env.STRIPE_PRICE_SCALE,
  agence: process.env.STRIPE_PRICE_AGENCE,
};

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  try {
    const { planSlug, email } = await req.json();
    const priceId = PRICE_MAP[planSlug];
    if (!priceId) return NextResponse.json({ error: "Plan ou prix non configuré", planSlug, priceId }, { status: 400 });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      payment_method_collection: "if_required",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      subscription_data: { trial_period_days: 30, metadata: { planSlug } },
      metadata: { planSlug },
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe error:", e.type, e.code, e.message);
    return NextResponse.json({
      error: e.message,
      type: e.type,
      code: e.code,
      statusCode: e.statusCode,
    }, { status: 500 });
  }
}
