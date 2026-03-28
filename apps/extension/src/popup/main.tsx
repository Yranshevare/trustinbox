import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@repo/ui-web/button";
import { Input } from "@repo/ui-web/input";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui-web/card";
import { useState, useEffect } from "react";
import "../globals.css";

interface AuthStatus {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const sendOtp = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/request-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) throw new Error("Failed to send OTP");

      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otp }),
        },
      );

      if (!response.ok) throw new Error("Invalid OTP");

      const data = await response.json();

      chrome.runtime.sendMessage({
        type: "SET_AUTH",
        user: { email, name: email.split("@")[0] },
        token: data.token,
      });

      onSuccess();
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="space-y-4">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold">Welcome to TrustInBox</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to protect your emails
        </p>
      </div>

      {step === "email" ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button className="w-full" onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code sent to
            <br />
            <strong>{email}</strong>
          </p>
          <div>
            <label htmlFor="otp" className="mb-1 block text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              className="text-center font-mono text-lg tracking-widest"
              maxLength={6}
            />
          </div>
          <Button className="w-full" onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Sign In"}
          </Button>
          <button
            onClick={() => setStep("email")}
            disabled={countdown > 0}
            className="text-muted-foreground hover:text-foreground w-full text-sm disabled:opacity-50"
          >
            {countdown > 0
              ? `Resend in ${countdown}s`
              : "Use a different email"}
          </button>
        </div>
      )}

      {error && <p className="text-destructive text-center text-sm">{error}</p>}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [stats, setStats] = useState({ analyzed: 0, threats: 0 });

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_AUTH_STATUS" },
      (status: AuthStatus) => {
        if (status.user) {
          setUser(status.user);
        }
      },
    );
  }, []);

  const handleLogout = () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" });
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Protection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-xl text-green-500">✓</span>
            <span className="text-sm">Active Protection</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.analyzed}</p>
              <p className="text-muted-foreground text-xs">Emails Analyzed</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.threats}</p>
              <p className="text-muted-foreground text-xs">Threats Blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs">
        <p>Open Gmail to analyze emails</p>
        <p className="mt-1">🛡️ Powered by TrustInBox</p>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_AUTH_STATUS" },
      (status: AuthStatus) => {
        setIsAuthenticated(status?.isAuthenticated || false);
        setLoading(false);
      },
    );
  }, []);

  if (loading) {
    return (
      <div className="flex min-w-[320px] items-center justify-center p-6">
        <div className="trustinbox-spinner-large"></div>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] p-4">
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LoginForm onSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
