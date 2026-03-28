import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "./perms.js";
import { db } from "../../../core/db/client.js";
import { member as memberSchema, user } from "../../../core/db/schema/index.js";
import { eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import { and } from "drizzle-orm";
import { sendEmail } from "../resend/send-email.js";
import { stripeClient } from "../../../core/stripe/client.js";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // send email
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.FRONTEND_URL}/dashboard`;
      await sendEmail({
        from: process.env.RESEND_EMAIL!,
        to: user.email,
        subject: "Verify your email",
        html: `<div>Hi ${user.name}, please verify your email by clicking <a href="${verificationUrl}">here</a></div>`,
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (u) => {
        await db.delete(user).where(eq(user.id, u.id));
      },
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        // send email
      },
    },
  },
  plugins: [
    organization({
      cancelPendingInvitationsOnReInvite: true,
      ac,
      roles: {
        admin,
        member,
        owner,
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization, member, user }) => {
          await sendEmail({
            from: process.env.RESEND_EMAIL!,
            to: user.email,
            subject: "Welcome!",
            html: `<div>Hi ${user.name}, welcome to out platform!</div>`,
          });
        },
        afterAddMember: async ({ member, user, organization }) => {
          await sendEmail({
            from: process.env.RESEND_EMAIL!,
            to: user.email,
            subject: "You've been added to an organization",
            html: `<div>Hi ${user.name}, you've been added to ${organization.name}</div>`,
          });
        },
        beforeCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }) => {
          const customExpiration = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
          ); // 7 days
          return {
            data: {
              ...invitation,
              expiresAt: customExpiration,
            },
          };
        },
        afterCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }) => {
          await sendEmail({
            from: process.env.RESEND_EMAIL!,
            to: invitation.email,
            subject: "You've been invited to an organization",
            html: `<div>Hi ${invitation.email}, you've been invited to ${organization.name}</div>`,
          });
        },
        afterAcceptInvitation: async ({
          invitation,
          member,
          user,
          organization,
        }) => {
          // todo: send email
          await sendEmail({
            from: process.env.RESEND_EMAIL!,
            to: user.email,
            subject: "You've joined an organization",
            html: `<div>Hi ${user.name}, you've joined ${organization.name}</div>`,
          });
        },
        afterRejectInvitation: async ({ invitation, user, organization }) => {
          // todo: send email
        },
        beforeCancelInvitation: async ({
          invitation,
          cancelledBy,
          organization,
        }) => {
          // todo: send email
        },
        afterCancelInvitation: async ({
          invitation,
          cancelledBy,
          organization,
        }) => {
          // todo: send email
        },
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "monthly",
            priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
          },
          {
            name: "yearly",
            priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
          },
        ],
        // getCheckoutSessionParams: async ({ plan }) => {
        //   return {
        //     params: {
        //       line_items: [
        //         {
        //           price: plan.priceId,
        //           quantity: 1,
        //         },
        //         {
        //           price: process.env.STRIPE_ONE_TIME_PRICE_ID!,
        //           quantity: 1,
        //         },
        //       ],
        //       metadata: {
        //         includesSetupFee: "true",
        //       },
        //     },
        //   };
        // },
        authorizeReference: async ({ user, referenceId }) => {
          const [mem] = await db
            .select()
            .from(memberSchema)
            .where(
              and(
                eq(memberSchema.userId, user.id),
                eq(memberSchema.organizationId, referenceId),
              ),
            );

          return mem?.role === "owner" || mem?.role === "admin";
        },
      },
    }),
  ],
});
