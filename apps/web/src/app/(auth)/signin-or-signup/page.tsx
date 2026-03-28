"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/repo/ui-web/button";
import { FieldSeparator } from "@/repo/ui-web/field";
import { InputGroup } from "@/repo/ui-web/input-group";
import { InputGroupInput } from "@/repo/ui-web/input-group";
import { Label } from "@/repo/ui-web/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Loader } from "@/repo/ui-web/loader";
import Link from "next/link";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Logo } from "@/repo/ui-web/logo";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [callbackURL, setCallbackURL] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackURL(params.get("callbackURL") ?? `${window.location.origin}/`);
  }, []);

  async function handleSocialLogin() {
    try {
      setLoadingGoogle(true);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (error) toast.error(error.message);
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid place-content-center place-items-center items-center gap-5">
        <Logo />
        <div className="bg-muted/50 grid w-full max-w-sm gap-6 rounded-xl p-6">
          <div className="grid gap-2">
            <h1 className="text-xl font-medium">Login Or Signup</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sign in or create an account with your Google account to continue.
            </p>
          </div>
          <Button
            disabled={loadingGoogle}
            onClick={handleSocialLogin}
            className="w-full text-center"
          >
            Continue with Google
            <IconBrandGoogle />
          </Button>
        </div>
      </div>
    </div>
  );
}
