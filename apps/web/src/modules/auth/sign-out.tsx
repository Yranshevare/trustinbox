"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/repo/ui-web/button";
import { Loader } from "@/repo/ui-web/loader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SignOutProps {
  children: React.ReactNode;
  size?: "icon-sm" | "lg" | "icon" | "sm";
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
}

export default function SignOut({
  children,
  size = "icon-sm",
  variant = "default",
  className,
}: SignOutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await authClient.signOut();
    setLoading(false);
    if (!error)
      return (window.location.href =
        process.env.NEXT_PUBLIC_MARKETING_URL || "/");
    toast.error(error.message || "An error occurred while signing out.");
  };

  return (
    <Button
      disabled={loading}
      onClick={handleSignOut}
      size={size}
      variant={variant}
      className={className}
    >
      {children}
    </Button>
  );
}
