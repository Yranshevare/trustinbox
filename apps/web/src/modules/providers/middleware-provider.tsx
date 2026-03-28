"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Session, User } from "better-auth";

interface MiddlewareContextValue {
  data: {
    user: User;
    session: Session;
  } | null;
}

export const MiddlewareContext = createContext<MiddlewareContextValue>({
  data: null,
});

export default function MiddlewareProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!data?.session) {
      if (!pathname.startsWith("/auth")) {
        router.replace("/auth/sign-in");
      }
      return;
    }

    if (pathname.startsWith("/auth")) {
      router.replace("/");
    }
  }, [data, pathname, router, isPending]);

  return (
    <MiddlewareContext.Provider
      value={
        data?.session
          ? { data: { user: data.user, session: data.session } }
          : { data: null }
      }
    >
      {children}
    </MiddlewareContext.Provider>
  );
}

export const useMiddleware = () => {
  const context = useContext(MiddlewareContext);
  if (!context) {
    throw new Error("useMiddleware must be used within an Middleware Provider");
  }
  return context.data;
};
