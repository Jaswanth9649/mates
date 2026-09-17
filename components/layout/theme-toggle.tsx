"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoids a hydration mismatch (server doesn't know the theme) without
  // setState-in-effect: false on the server, true once client JS runs.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" />
        }
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}
