import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { inArray } from "drizzle-orm";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isGroupMember } from "@/lib/db/queries/groups";
import { getExpenseWithSplits } from "@/lib/db/queries/expenses";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; expenseId: string }>;
}) {
  const { groupId, expenseId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const result = await getExpenseWithSplits(expenseId);
  if (!result || result.expense.groupId !== groupId) notFound();

  const isMember = await isGroupMember(groupId, user.id);
  if (!isMember) notFound();

  const { expense, splits } = result;

  const db = getDb();
  const userIds = [expense.paidBy, ...splits.map((s) => s.userId)];
  const peopleRows = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(inArray(users.id, userIds));
  const nameById = new Map(peopleRows.map((p) => [p.id, p.displayName]));

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{expense.description}</h1>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/groups/${groupId}/expenses/${expenseId}/edit`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <DeleteExpenseButton expenseId={expenseId} groupId={groupId} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            {formatCurrency(expense.amountCents, expense.currency)}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {formatDate(expense.expenseDate)}
            {expense.category ? ` · ${expense.category}` : ""}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0">
          <p className="text-sm text-muted-foreground">
            Paid by <span className="font-medium text-foreground">{nameById.get(expense.paidBy)}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Split</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border pt-0">
          {splits.map((split) => (
            <div key={split.id} className="flex items-center gap-3 py-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">
                  {initials(nameById.get(split.userId) ?? "?")}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm">{nameById.get(split.userId)}</span>
              <span className="text-sm font-medium">
                {formatCurrency(split.owedAmountCents, expense.currency)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
