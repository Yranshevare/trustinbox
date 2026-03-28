import { Hono } from 'hono';
import { stripeLogic } from './stripe.logic.js';
import { requireAuth } from '../middlewares/require-auth.js';

export const stripeRoutes = new Hono();

stripeRoutes.use('*', requireAuth);

stripeRoutes.post('/connect/create-account/:orgId', async (c) => {
  return c.json(await stripeLogic.createConnectAccount(c.req.param('orgId')));
});

stripeRoutes.post('/connect/onboarding', async (c) => {
  const body = await c.req.json<{
    accountId: string;
    returnUrl: string;
    refreshUrl: string;
  }>();

  return c.json(
    await stripeLogic.createAccountLink(
      body.accountId,
      body.returnUrl,
      body.refreshUrl,
    ),
  );
});

stripeRoutes.post('/connect/login-link', async (c) => {
  const body = await c.req.json<{ accountId: string }>();
  return c.json(await stripeLogic.createLoginLink(body.accountId));
});

stripeRoutes.get('/connect/status/:orgId', async (c) => {
  return c.json(await stripeLogic.checkAccountStatus(c.req.param('orgId')));
});

stripeRoutes.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) throw new Error('MISSING_STRIPE_SIGNATURE');

  const raw = Buffer.from(await c.req.arrayBuffer());

  return c.json(await stripeLogic.handleWebhook(signature, raw));
});
