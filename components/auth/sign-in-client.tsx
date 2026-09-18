"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthWidgetStallGuard } from "@/components/auth/auth-widget-stall-guard";

// Matches app/icon.tsx's real branding, not an arbitrary accent — this app
// is otherwise a neutral black/white theme (every primary button is
// bg-primary), so Clerk's accent color should track that instead of
// standing out as its own color.
const PRIMARY_LIGHT = "#18181b";
const PRIMARY_DARK = "#fafafa";

export function SignInClient() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <AuthPageHeader>Sign in to MATES</AuthPageHeader>

        <AuthWidgetStallGuard>
          <SignIn
            appearance={{
              theme: isDark ? dark : undefined,
              variables: {
                colorPrimary: isDark ? PRIMARY_DARK : PRIMARY_LIGHT,
                borderRadius: "0.625rem",
              },
            }}
          />
        </AuthWidgetStallGuard>
      </div>
    </div>
  );
}
