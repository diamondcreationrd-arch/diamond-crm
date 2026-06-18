import Stripe from "stripe";

const rawKey = process.env.STRIPE_SECRET_KEY;
const key = rawKey?.trim();

const stripe: Stripe | null = key
  ? new Stripe(key, { apiVersion: "2023-10-16" as any })
  : null;

export default stripe;
