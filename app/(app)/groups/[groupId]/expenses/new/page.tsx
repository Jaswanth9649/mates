import { notFound } from "next/navigation";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { CURRENT_USER_ID, getGroup, getGroupMembers } from "@/lib/mock-data";

export default async function NewExpensePage({
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
        Add expense
      </h1>
      <ExpenseForm
        groupId={groupId}
        members={members}
        currency={group.currency}
        defaultPaidBy={CURRENT_USER_ID}
      />
    </div>
  );
}
