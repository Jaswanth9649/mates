import Link from "next/link";
import { notFound } from "next/navigation";
import { HandCoins } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, initials } from "@/lib/format";
import {
  CURRENT_USER_ID,
  PEOPLE,
  computeBalances,
  getSharedGroups,
} from "@/lib/mock-data";

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const friend = PEOPLE.find((p) => p.id === userId);
  if (!friend) notFound();

  const overall = computeBalances({ forUserId: CURRENT_USER_ID }).find(
    (b) => b.counterpart.id === userId
  );
  const sharedGroups = getSharedGroups(userId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback>{initials(friend.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{friend.name}</h1>
          <p
            className={
              !overall || overall.netCents === 0
                ? "text-sm text-muted-foreground"
                : overall.netCents > 0
                  ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  : "text-sm font-medium text-red-600 dark:text-red-400"
            }
          >
            {!overall || overall.netCents === 0
              ? "Settled up"
              : overall.netCents > 0
                ? `Owes you ${formatCurrency(overall.netCents)}`
                : `You owe ${formatCurrency(Math.abs(overall.netCents))}`}
          </p>
        </div>
        <div className="flex-1" />
        {sharedGroups[0] && (
          <Button
            render={<Link href={`/groups/${sharedGroups[0].id}/settle`} />}
            nativeButton={false}
            size="sm"
            variant="outline"
          >
            <HandCoins className="size-4" />
            Settle up
          </Button>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Shared groups</h2>
        <div className="flex flex-col gap-2">
          {sharedGroups.map((group) => {
            const groupBalance = computeBalances({
              forUserId: CURRENT_USER_ID,
              groupId: group.id,
            }).find((b) => b.counterpart.id === userId);
            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <span className="text-sm font-medium">{group.name}</span>
                    <span
                      className={
                        !groupBalance
                          ? "text-xs text-muted-foreground"
                          : groupBalance.netCents > 0
                            ? "text-sm text-emerald-600 dark:text-emerald-400"
                            : "text-sm text-red-600 dark:text-red-400"
                      }
                    >
                      {!groupBalance
                        ? "settled"
                        : formatCurrency(groupBalance.netCents)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
