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

  async function handleManualLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoadingManual(true);
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) return toast.error(error.message);
      router.push(callbackURL);
    } finally {
      setLoadingManual(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20 sm:px-0 md:py-28">
      <div className="grid gap-1 text-center">
        <h1 className="text-lg font-bold sm:text-xl">
          Login to Continue
        </h1>
        <p className="text-foreground/80 text-sm sm:text-base">
          Use your Google account or your email to sign in.
        </p>
      </div>

      <div className="mt-10 grid gap-10">
        <div className="grid gap-3">
          <Button
            disabled={loadingGoogle}
            onClick={handleSocialLogin}
            className="w-full text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836h-3.66a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
            </svg>
            Continue with Google
          </Button>
        </div>

        <FieldSeparator>Or</FieldSeparator>

        <form onSubmit={handleManualLogin} className="grid gap-2">
          <Label>Email</Label>
          <InputGroup className="mb-3">
            <InputGroupInput
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
            />
          </InputGroup>

          <Label>Password</Label>
          <InputGroup className="mb-4">
            <InputGroupInput
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*********"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </Button>
          </InputGroup>

          <Button type="submit" disabled={loadingManual}>
            {loadingManual && <Loader />}
            Continue
          </Button>

          <p className="text-foreground/80 mt-2 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-foreground underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
