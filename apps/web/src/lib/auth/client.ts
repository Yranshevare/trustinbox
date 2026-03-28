import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import env from "env.config";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  plugins: [
    organizationClient(),
    stripeClient({
      subscription: true,
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  accountInfo,
  deleteUser,
  listSessions,
  refreshToken,
} = authClient;
