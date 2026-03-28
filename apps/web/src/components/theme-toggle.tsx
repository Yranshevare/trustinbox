"use client";

import { Button } from "@repo/ui-web/button";
import { motion } from "framer-motion";
import { IconContrast } from "@tabler/icons-react";

import { useTheme } from "@/modules/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="icon-sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <IconContrast className="size-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
