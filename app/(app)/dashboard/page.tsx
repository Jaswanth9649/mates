import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupsForUser } from "@/lib/db/queries/groups";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const groups = user ? await getGroupsForUser(user.id) : [];

  // Balances/activity are always zero/empty until the expense system (Phase 2)
  // is wired up — there's no fabricated data here, just the honest current state.
  const owedToYou = 0;
  const youOwe = 0;

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
            {groups.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No groups yet.
              </p>
            ) : (
              groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardContent className="flex items-center justify-between py-4">
                      <p className="text-sm font-medium">{group.name}</p>
                      <span className="text-xs text-muted-foreground">settled</span>
                    </CardContent>
                  </Card>
                </Link>
              ))
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
          <ActivityFeed items={[]} />
        </div>
      </div>
    </div>
  );
}
