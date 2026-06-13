import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

const stripe: Stripe | null = key
  ? new Stripe(key, { apiVersion: "2024-06-20" as any })
  : null;

export default stripe;
