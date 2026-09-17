import { redirect } from "next/navigation";

// TODO(auth): once Clerk is wired up, redirect signed-out visitors to a
// marketing/sign-in page instead of straight into the app.
export default function Home() {
  redirect("/dashboard");
}
