import { notFound } from "next/navigation";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupById, getGroupMembers, isGroupMember } from "@/lib/db/queries/groups";

export default async function NewExpensePage({
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

  const groupMembers = await getGroupMembers(groupId);
  const members = groupMembers
    .filter((m) => m.user)
    .map((m) => ({ id: m.user!.id, name: m.user!.displayName, email: m.user!.email }));

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Add expense
      </h1>
      <ExpenseForm
        groupId={groupId}
        members={members}
        currency={group.currency}
        defaultPaidBy={user.id}
      />
    </div>
  );
}
