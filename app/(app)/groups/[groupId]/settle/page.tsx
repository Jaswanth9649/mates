import { notFound } from "next/navigation";

import { SettleForm } from "@/components/settlements/settle-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupById, isGroupMember } from "@/lib/db/queries/groups";

export default async function SettlePage({
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
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settle up</h1>
      <SettleForm groupId={groupId} balances={[]} currency={group.currency} />
    </div>
  );
}
