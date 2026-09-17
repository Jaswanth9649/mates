import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupById, isGroupMember } from "@/lib/db/queries/groups";

export default async function RecurringSchedulesPage({
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Recurring expenses
          </h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
        <Button render={<Link href={`/groups/${groupId}/recurring/new`} />} nativeButton={false} size="sm">
          <Plus className="size-4" />
          New schedule
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <RefreshCw className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No recurring expenses yet</p>
          <p className="text-xs text-muted-foreground">
            Set up rent, subscriptions, or bills to auto-generate on a schedule.
          </p>
        </div>
        <Button
          render={<Link href={`/groups/${groupId}/recurring/new`} />}
          nativeButton={false}
          size="sm"
          variant="outline"
        >
          Create a schedule
        </Button>
      </div>
    </div>
  );
}
