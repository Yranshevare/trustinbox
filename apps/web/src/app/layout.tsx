import { TooltipProvider } from "@repo/ui-web/tooltip";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/modules/providers/theme-provider";
import { Toaster } from "@/repo/ui-web/sonner";

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "  AI",
  description: "A modern operation system for growing restaurants!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background text-foreground ${geist.className}`}
        suppressHydrationWarning
      >
        <ThemeProvider storageKey="app-theme">
          <TooltipProvider>
            {children}
            <Toaster expand />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
