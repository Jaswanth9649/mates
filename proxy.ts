import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk's request context (used by `auth()` in Server Components/routes)
// depends on this being present. Actual route protection now lives in
// app/(app)/layout.tsx per Clerk's resource-based auth guidance, rather
// than the deprecated createRouteMatcher + auth.protect() middleware
// pattern.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
