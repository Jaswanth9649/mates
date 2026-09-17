import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupsForUser } from "@/lib/db/queries/groups";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user) {
    // Rare race: signed in via Clerk but the webhook hasn't synced the
    // users row yet. Refreshing in a moment resolves it.
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Finishing account setup — refresh in a few seconds.
      </div>
    );
  }

  const groups = await getGroupsForUser(user.id);

  return (
    <AppShell user={user} groups={groups}>
      {children}
    </AppShell>
  );
}
