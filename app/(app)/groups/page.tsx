import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupsForUser } from "@/lib/db/queries/groups";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  const groups = user ? await getGroupsForUser(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
          <p className="text-sm text-muted-foreground">
            Shared expenses, organized by trip, house, or occasion.
          </p>
        </div>
        <Button render={<Link href="/groups/new" />} nativeButton={false} size="sm">
          <Plus className="size-4" />
          New group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;re not in any groups yet.
          </p>
          <Button
            render={<Link href="/groups/new" />}
            nativeButton={false}
            size="sm"
            className="mt-4"
          >
            Create your first group
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between py-5">
                  <p className="font-medium">{group.name}</p>
                  <span className="text-xs text-muted-foreground">settled up</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
