import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const s = getStripeOptional();
  if (!s) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return s;
}

export function getStripeOptional(): Stripe | null {
  if (stripeClient) {
    return stripeClient;
  }

  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    return null;
  }

  stripeClient = new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
  });

  return stripeClient;
}
