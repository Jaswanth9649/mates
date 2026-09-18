"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Receipt } from "lucide-react";

const EMERALD = "#10b981";

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <Receipt className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Create your{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text font-extrabold text-transparent">
              MATES
            </span>{" "}
            account
          </h1>
        </div>

        <SignUp
          appearance={{
            theme: resolvedTheme === "dark" ? dark : undefined,
            variables: {
              colorPrimary: EMERALD,
              borderRadius: "0.625rem",
            },
          }}
        />

        {/* See the matching comment on the sign-in page: dev-instance Clerk
            + no custom domain yet means this cross-domain cookie can get
            blocked by browser privacy settings. */}
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Stuck signing up? Try allowing third-party cookies for this site, or
          use a browser like Chrome with default privacy settings.
        </p>
      </div>
    </div>
  );
}
