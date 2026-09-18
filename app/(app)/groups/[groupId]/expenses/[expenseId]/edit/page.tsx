import { notFound } from "next/navigation";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupById, getGroupMembers, isGroupMember } from "@/lib/db/queries/groups";
import { getExpenseWithSplits } from "@/lib/db/queries/expenses";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ groupId: string; expenseId: string }>;
}) {
  const { groupId, expenseId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const group = await getGroupById(groupId);
  if (!group) notFound();

  const isMember = await isGroupMember(groupId, user.id);
  if (!isMember) notFound();

  const result = await getExpenseWithSplits(expenseId);
  if (!result || result.expense.groupId !== groupId) notFound();

  const groupMembers = await getGroupMembers(groupId);
  const members = groupMembers
    .filter((m) => m.user)
    .map((m) => ({ id: m.user!.id, name: m.user!.displayName, email: m.user!.email }));

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit expense</h1>
      <ExpenseForm
        groupId={groupId}
        members={members}
        currency={group.currency}
        defaultPaidBy={result.expense.paidBy}
        initial={{
          expenseId,
          description: result.expense.description,
          amountCents: result.expense.amountCents,
          category: result.expense.category ?? "General",
          expenseDate: result.expense.expenseDate,
          paidBy: result.expense.paidBy,
          // A receipt-scanned expense is "line_item" server-side, but only the
          // per-person totals are persisted (no line-item text), so editing it
          // is functionally identical to editing exact amounts.
          splitType:
            result.expense.splitType === "line_item"
              ? "exact"
              : (result.expense.splitType as "equal" | "exact" | "percentage"),
          splits: result.splits.map((s) => ({
            userId: s.userId,
            amountCents: s.owedAmountCents,
          })),
        }}
      />
    </div>
  );
}
