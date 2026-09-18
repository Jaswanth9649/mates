import type { Metadata } from "next";
import { SignUpClient } from "@/components/auth/sign-up-client";

export const metadata: Metadata = {
  title: "Sign up – MATES",
};

export default function SignUpPage() {
  return <SignUpClient />;
}
