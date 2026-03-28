import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "../../../core/db/client.js";
import { member as memberSchema, user } from "../../../core/db/schema/index.js";
import { eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import { and } from "drizzle-orm";
import { sendEmail } from "../resend/send-email.js";

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
  plugins: [],
});
