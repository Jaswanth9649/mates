import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, initials } from "@/lib/format";
import {
  CURRENT_USER_ID,
  GROUPS,
  computeBalances,
  getGroupMembers,
} from "@/lib/mock-data";

export default function GroupsPage() {
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

      {GROUPS.length === 0 ? (
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
          {GROUPS.map((group) => {
            const members = getGroupMembers(group.id);
            const net = computeBalances({
              forUserId: CURRENT_USER_ID,
              groupId: group.id,
            }).reduce((sum, b) => sum + b.netCents, 0);

            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardContent className="flex flex-col gap-4 py-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {members.length} members
                        </p>
                      </div>
                      <span
                        className={
                          net === 0
                            ? "text-xs text-muted-foreground"
                            : net > 0
                              ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                              : "text-sm font-medium text-red-600 dark:text-red-400"
                        }
                      >
                        {net === 0 ? "settled up" : formatCurrency(net)}
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      {members.map((m) => (
                        <Avatar
                          key={m.id}
                          className="size-7 border-2 border-card"
                        >
                          <AvatarFallback className="text-[10px]">
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
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
