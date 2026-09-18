import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupsForUser } from "@/lib/db/queries/groups";
import { getGroupNetBalances } from "@/lib/db/queries/balances";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  const groups = user ? await getGroupsForUser(user.id) : [];
  const netByGroupId = user
    ? await getGroupNetBalances(groups.map((g) => g.id), user.id)
    : new Map<string, number>();

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
          {groups.map((group) => {
            const net = netByGroupId.get(group.id) ?? 0;
            const label =
              net === 0
                ? "settled up"
                : net > 0
                  ? `owed ${formatCurrency(net, group.currency)}`
                  : `you owe ${formatCurrency(Math.abs(net), group.currency)}`;
            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between py-5">
                    <p className="font-medium">{group.name}</p>
                    <span
                      className={cn(
                        "text-xs",
                        net > 0 && "text-emerald-600 dark:text-emerald-400",
                        net < 0 && "text-red-600 dark:text-red-400",
                        net === 0 && "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
