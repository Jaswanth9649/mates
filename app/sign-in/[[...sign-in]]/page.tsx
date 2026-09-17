"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Receipt } from "lucide-react";

const EMERALD = "#10b981";

export default function SignInPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <Receipt className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in to{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text font-extrabold text-transparent">
              MATES
            </span>
          </h1>
        </div>

        <SignIn
          appearance={{
            theme: resolvedTheme === "dark" ? dark : undefined,
            variables: {
              colorPrimary: EMERALD,
              borderRadius: "0.625rem",
            },
          }}
        />
      </div>
    </div>
  );
}
