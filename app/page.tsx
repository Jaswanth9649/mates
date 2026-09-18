import { redirect } from "next/navigation";

// Always redirect to /dashboard: signed-in visitors land on their dashboard,
// and signed-out visitors get bounced to /sign-in by the (app) layout's auth
// check, so there's no separate marketing page to detour through.
export default function Home() {
  redirect("/dashboard");
}
