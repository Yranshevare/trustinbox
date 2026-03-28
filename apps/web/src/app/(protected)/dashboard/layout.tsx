import MiddlewareProvider from "@/modules/providers/middleware-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MiddlewareProvider>{children}</MiddlewareProvider>;
}
