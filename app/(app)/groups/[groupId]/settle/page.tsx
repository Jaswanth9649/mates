import { notFound } from "next/navigation";

import { SettleForm } from "@/components/settlements/settle-form";
import { CURRENT_USER_ID, computeBalances, getGroup } from "@/lib/mock-data";

export default async function SettlePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) notFound();

  const balances = computeBalances({ forUserId: CURRENT_USER_ID, groupId });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settle up</h1>
      <SettleForm groupId={groupId} balances={balances} currency={group.currency} />
    </div>
  );
}
