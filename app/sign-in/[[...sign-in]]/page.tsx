import Link from "next/link";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// TODO(auth): swap this placeholder for Clerk's <SignIn /> once the Clerk
// Marketplace integration is provisioned (Phase 0).
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
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

        <Card>
          <CardHeader className="pb-0" />
          <CardContent className="pt-4">
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" className="mt-1" disabled>
                Sign in
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Authentication isn&apos;t wired up yet — this screen is a visual
                placeholder for Clerk.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
