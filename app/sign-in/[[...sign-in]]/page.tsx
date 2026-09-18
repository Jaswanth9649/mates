import type { Metadata } from "next";
import { SignInClient } from "@/components/auth/sign-in-client";

export const metadata: Metadata = {
  title: "Sign in – MATES",
};

export default function SignInPage() {
  return <SignInClient />;
}
