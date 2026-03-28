import Stripe from 'stripe';
import 'dotenv/config';

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as any,
});
