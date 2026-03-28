import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useSession } from "@/auth/client";
import { LoginForm } from "./LoginForm";
import { Dashboard } from "./Dashboard";
import "../../globals.css";

export { LoginForm, Dashboard };

function Popup() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-w-[320px] items-center justify-center p-6">
        <div className="trustinbox-spinner-large"></div>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] p-4">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold">Welcome to TrustInBox</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to protect your emails
        </p>
      </div>

      {session?.user ? (
        <Dashboard user={session.user} />
      ) : (
        <LoginForm onSuccess={() => {}} />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
