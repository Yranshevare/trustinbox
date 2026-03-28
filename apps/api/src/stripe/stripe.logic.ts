import Stripe from 'stripe';
import { db } from '../core/db/client.js';
import { organization } from '../core/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { stripeClient } from '../core/stripe/client.js';

export const stripeLogic = {
  async createConnectAccount(organizationId: string) {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId));

    if (!org) throw new Error('ORG_NOT_FOUND');

    if (org.stripeAccountId) {
      return stripeClient.accounts.retrieve(org.stripeAccountId);
    }

    let email: string | undefined;
    try {
      if (org.metadata) {
        email = JSON.parse(org.metadata).email;
      }
    } catch (err: any) {
      console.error(err);
    }

    if (!email) throw new Error('ORG_EMAIL_NOT_FOUND');

    const account = await stripeClient.accounts.create({
      email,
      controller: {
        losses: { payments: 'application' },
        fees: { payer: 'application' },
        stripe_dashboard: { type: 'express' },
      },
    });

    await db
      .update(organization)
      .set({ stripeAccountId: account.id })
      .where(eq(organization.id, org.id));

    return account;
  },

  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ) {
    return stripeClient.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  },

  async createLoginLink(accountId: string) {
    return stripeClient.accounts.createLoginLink(accountId);
  },

  async checkAccountStatus(orgId: string) {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, orgId));

    if (!org?.stripeAccountId) return false;

    return stripeClient.accounts.retrieve(org.stripeAccountId);
  },

  async handleWebhook(signature: string, payload: Buffer) {
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === 'account.updated') {
      const account = event.data.object;

      if (account.details_submitted) {
        await db
          .update(organization)
          .set({ isConnectAccountLinked: true })
          .where(eq(organization.stripeAccountId, account.id));
      }
    }

    if (event.type === 'account.application.deauthorized') {
      const account = event.data.object;

      await db
        .update(organization)
        .set({
          isConnectAccountLinked: false,
          stripeAccountId: null,
        })
        .where(eq(organization.stripeAccountId, account.id));
    }

    return { received: true };
  },
};
