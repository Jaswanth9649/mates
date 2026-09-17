import { notFound } from "next/navigation";

import { RecurringForm } from "@/components/recurring/recurring-form";
import { CURRENT_USER_ID, getGroup, getGroupMembers } from "@/lib/mock-data";

export default async function NewRecurringPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) notFound();

  const members = getGroupMembers(groupId);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        New recurring expense
      </h1>
      <RecurringForm
        groupId={groupId}
        members={members}
        currency={group.currency}
        defaultPaidBy={CURRENT_USER_ID}
      />
    </div>
  );
}
