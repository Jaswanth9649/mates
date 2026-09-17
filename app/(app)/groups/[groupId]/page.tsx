import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Receipt, HandCoins, Users, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { BalanceSummary } from "@/components/balances/balance-summary";
import { initials } from "@/lib/format";
import {
  CURRENT_USER_ID,
  computeBalances,
  getGroup,
  getGroupActivity,
  getGroupMembers,
} from "@/lib/mock-data";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) notFound();

  const members = getGroupMembers(groupId);
  const activity = getGroupActivity(groupId);
  const balances = computeBalances({ forUserId: CURRENT_USER_ID, groupId });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.map((m) => (
                <Avatar key={m.id} className="size-7 border-2 border-card">
                  <AvatarFallback className="text-[10px]">
                    {initials(m.name)}
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
          <ActivityFeed items={activity} />
        </TabsContent>
        <TabsContent value="balances" className="mt-4">
          <BalanceSummary
            items={balances}
            currency={group.currency}
            settleHref={() => `/groups/${groupId}/settle`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
