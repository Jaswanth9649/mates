import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Receipt, HandCoins, Users, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { BalanceSummary } from "@/components/balances/balance-summary";
import { initials } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isGroupMember, getGroupById, getGroupMembers } from "@/lib/db/queries/groups";
import { getGroupActivityForUser } from "@/lib/db/queries/expenses";
import { getGroupSettlementsForActivity } from "@/lib/db/queries/settlements";
import { computeGroupBalances } from "@/lib/db/queries/balances";
import type { ActivityItem } from "@/lib/activity";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const group = await getGroupById(groupId);
  if (!group) notFound();

  const isMember = await isGroupMember(groupId, user.id);
  if (!isMember) notFound();

  const [members, expenseActivity, settlementActivity, balances] = await Promise.all([
    getGroupMembers(groupId),
    getGroupActivityForUser(groupId, user.id),
    getGroupSettlementsForActivity(groupId),
    computeGroupBalances(groupId, user.id),
  ]);
  const activity: ActivityItem[] = [...expenseActivity, ...settlementActivity].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const memberLabels = members.map((m) => ({
    id: m.id,
    label: m.user?.displayName ?? m.invitedEmail ?? "Pending",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              {memberLabels.map((m) => (
                <Avatar key={m.id} className="size-7 border-2 border-card">
                  <AvatarFallback className="text-[10px]">
                    {initials(m.label)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Link
              href={`/groups/${groupId}/members`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Users className="size-3" />
              {members.length} members
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            render={<Link href={`/groups/${groupId}/receipts/new`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Receipt className="size-4" />
            Scan receipt
          </Button>
          <Button
            render={<Link href={`/groups/${groupId}/recurring`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="size-4" />
            Recurring
          </Button>
          <Button
            render={<Link href={`/groups/${groupId}/settle`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <HandCoins className="size-4" />
            Settle up
          </Button>
          <Button
            render={<Link href={`/groups/${groupId}/expenses/new`} />}
            nativeButton={false}
            size="sm"
          >
            <Plus className="size-4" />
            Add expense
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <ActivityFeed
            items={activity}
            getHref={(item) =>
              item.kind === "expense" ? `/groups/${groupId}/expenses/${item.id}` : undefined
            }
          />
        </TabsContent>
        <TabsContent value="balances" className="mt-4">
          <BalanceSummary
            items={balances}
            settleHref={() => `/groups/${groupId}/settle`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
