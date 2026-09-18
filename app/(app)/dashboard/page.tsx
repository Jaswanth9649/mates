import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupsForUser } from "@/lib/db/queries/groups";
import { computeAllBalancesForUser, getGroupNetBalances } from "@/lib/db/queries/balances";
import { getRecentActivityForUser } from "@/lib/db/queries/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const groups = user ? await getGroupsForUser(user.id) : [];
  const groupIds = groups.map((g) => g.id);
  const [balances, activity, netByGroupId] = user
    ? await Promise.all([
        computeAllBalancesForUser(user.id),
        getRecentActivityForUser(user.id, groupIds, 8),
        getGroupNetBalances(groupIds, user.id),
      ])
    : [[], [], new Map<string, number>()];

  // The three stat cards show the user's default currency only — mixing
  // currencies into one number would be meaningless. Any balance in a
  // different currency still shows up in full on the Friends page.
  const primaryCurrency = user?.defaultCurrency ?? "USD";
  const primaryBalances = balances.filter((b) => b.currency === primaryCurrency);
  const owedToYou = primaryBalances
    .filter((b) => b.netCents > 0)
    .reduce((sum, b) => sum + b.netCents, 0);
  const youOwe = primaryBalances
    .filter((b) => b.netCents < 0)
    .reduce((sum, b) => sum + Math.abs(b.netCents), 0);
  const otherCurrencies = Array.from(
    new Set(balances.filter((b) => b.currency !== primaryCurrency).map((b) => b.currency))
  );

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
              {formatCurrency(owedToYou, primaryCurrency)}
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
              {formatCurrency(youOwe, primaryCurrency)}
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
              {formatCurrency(owedToYou - youOwe, primaryCurrency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {otherCurrencies.length > 0 && (
        <p className="-mt-4 text-xs text-muted-foreground">
          You also have balances in {otherCurrencies.join(", ")} —{" "}
          <Link href="/friends" className="underline hover:text-foreground">
            see the full breakdown
          </Link>
          .
        </p>
      )}

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
            {groups.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No groups yet.
              </p>
            ) : (
              groups.map((group) => {
                const net = netByGroupId.get(group.id) ?? 0;
                const label =
                  net === 0
                    ? "settled"
                    : net > 0
                      ? `owed ${formatCurrency(net, group.currency)}`
                      : `you owe ${formatCurrency(Math.abs(net), group.currency)}`;
                return (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="flex items-center justify-between py-4">
                        <p className="text-sm font-medium">{group.name}</p>
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
              })
            )}
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
          <ActivityFeed items={activity} />
        </div>
      </div>
    </div>
  );
}
