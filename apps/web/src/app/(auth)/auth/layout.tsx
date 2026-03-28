import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login or Signup To Continue",
  description: "Use your email and password to login or signup to continue.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed flex h-full w-full items-center justify-center">
      {children}
    </div>
  );
}
