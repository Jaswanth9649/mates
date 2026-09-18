"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthWidgetStallGuard } from "@/components/auth/auth-widget-stall-guard";

// See sign-in-client.tsx for why these match app/icon.tsx instead of an
// arbitrary accent color.
const PRIMARY_LIGHT = "#18181b";
const PRIMARY_DARK = "#fafafa";

export function SignUpClient() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <AuthPageHeader>Create your MATES account</AuthPageHeader>

        <AuthWidgetStallGuard>
          <SignUp
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
