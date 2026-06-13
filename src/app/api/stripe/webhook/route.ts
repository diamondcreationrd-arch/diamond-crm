import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const planSlug = session.metadata?.planSlug;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const email = session.customer_email || session.customer_details?.email;

        if (!planSlug || !customerId || !subscriptionId) break;

        const plan = await prisma.plan.findFirst({ where: { slug: planSlug } });
        if (!plan) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        const client = email
          ? await prisma.client.findFirst({ where: { contactEmail: email } })
          : null;

        if (client) {
          await prisma.subscription.upsert({
            where: { clientId: client.id },
            create: {
              clientId: client.id,
              planId: plan.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "TRIALING",
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            update: {
              planId: plan.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "TRIALING",
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status =
          sub.status === "active" ? "ACTIVE"
          : sub.status === "trialing" ? "TRIALING"
          : sub.status === "past_due" ? "PAST_DUE"
          : sub.status === "canceled" ? "CANCELLED"
          : "PAUSED";

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : null;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
