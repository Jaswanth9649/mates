import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { formatCurrency } from "@/lib/format";
import {
  CURRENT_USER_ID,
  EXPENSES,
  GROUPS,
  SETTLEMENTS,
  computeBalances,
  type ActivityItem,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const balances = computeBalances({ forUserId: CURRENT_USER_ID });
  const owedToYou = balances
    .filter((b) => b.netCents > 0)
    .reduce((sum, b) => sum + b.netCents, 0);
  const youOwe = balances
    .filter((b) => b.netCents < 0)
    .reduce((sum, b) => sum + Math.abs(b.netCents), 0);

  const recentActivity: ActivityItem[] = [
    ...EXPENSES.map((expense) => ({
      kind: "expense" as const,
      id: expense.id,
      date: expense.date,
      expense,
    })),
    ...SETTLEMENTS.map((settlement) => ({
      kind: "settlement" as const,
      id: settlement.id,
      date: settlement.date,
      settlement,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A quick look at where things stand across all your groups.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              You are owed
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(owedToYou)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              You owe
            </CardTitle>
            <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(youOwe)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net balance
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency(owedToYou - youOwe)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your groups</h2>
            <Link
              href="/groups"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {GROUPS.map((group) => {
              const groupBalances = computeBalances({
                forUserId: CURRENT_USER_ID,
                groupId: group.id,
              });
              const net = groupBalances.reduce((sum, b) => sum + b.netCents, 0);
              return (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.memberIds.length} members
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
                        {net === 0 ? "settled" : formatCurrency(net)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <Button
            render={<Link href="/groups/new" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="mt-1"
          >
            New group
          </Button>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <ActivityFeed items={recentActivity} />
        </div>
      </div>
    </div>
  );
}
