import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenses, expenseSplits, users, type Expense } from "@/lib/db/schema";
import { exactSplitSumsToTotal } from "@/lib/splits";
import type { ActivityExpenseItem } from "@/lib/activity";

export type ExpenseSplitInput = { userId: string; amountCents: number };

export type ExpenseInput = {
  groupId: string;
  paidBy: string;
  description: string;
  amountCents: number;
  currency: string;
  category?: string;
  expenseDate: string;
  splitType: "equal" | "exact" | "percentage";
  splits: ExpenseSplitInput[];
  createdBy: string;
};

/**
 * Server-side invariant every write path must enforce: the submitted splits
 * always sum exactly to the expense total. Client-side math (equal/exact/
 * percentage calculators) is advisory only — this is the real boundary.
 */
export function assertSplitsSumToTotal(amountCents: number, splits: ExpenseSplitInput[]) {
  if (!exactSplitSumsToTotal(amountCents, splits)) {
    throw new Error("Splits do not sum to the expense total");
  }
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  assertSplitsSumToTotal(input.amountCents, input.splits);

  const db = getDb();
  const expenseId = randomUUID();

  const [expenseInsert, ...splitInserts] = await db.batch([
    db
      .insert(expenses)
      .values({
        id: expenseId,
        groupId: input.groupId,
        paidBy: input.paidBy,
        description: input.description,
        amountCents: input.amountCents,
        currency: input.currency,
        category: input.category,
        expenseDate: input.expenseDate,
        splitType: input.splitType,
        createdBy: input.createdBy,
      })
      .returning(),
    ...input.splits.map((split) =>
      db.insert(expenseSplits).values({
        expenseId,
        userId: split.userId,
        owedAmountCents: split.amountCents,
      })
    ),
  ]);
  void splitInserts;

  return expenseInsert[0];
}

export async function updateExpense(
  expenseId: string,
  input: Omit<ExpenseInput, "groupId" | "createdBy">
): Promise<void> {
  assertSplitsSumToTotal(input.amountCents, input.splits);

  const db = getDb();

  await db.batch([
    db
      .update(expenses)
      .set({
        paidBy: input.paidBy,
        description: input.description,
        amountCents: input.amountCents,
        currency: input.currency,
        category: input.category,
        expenseDate: input.expenseDate,
        splitType: input.splitType,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, expenseId)),
    db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expenseId)),
    ...input.splits.map((split) =>
      db.insert(expenseSplits).values({
        expenseId,
        userId: split.userId,
        owedAmountCents: split.amountCents,
      })
    ),
  ]);
}

export async function softDeleteExpense(expenseId: string) {
  const db = getDb();
  await db
    .update(expenses)
    .set({ deletedAt: new Date() })
    .where(eq(expenses.id, expenseId));
}

export async function getGroupExpenses(groupId: string) {
  const db = getDb();
  return db
    .select()
    .from(expenses)
    .where(and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));
}

export async function getGroupActivityForUser(
  groupId: string,
  forUserId: string
): Promise<ActivityExpenseItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: expenses.id,
      description: expenses.description,
      amountCents: expenses.amountCents,
      currency: expenses.currency,
      expenseDate: expenses.expenseDate,
      paidBy: expenses.paidBy,
      paidByName: users.displayName,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.paidBy, users.id))
    .where(and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));

  const expenseIds = rows.map((r) => r.id);
  const yourSplits =
    expenseIds.length > 0
      ? await db
          .select({
            expenseId: expenseSplits.expenseId,
            owedAmountCents: expenseSplits.owedAmountCents,
          })
          .from(expenseSplits)
          .where(
            and(eq(expenseSplits.userId, forUserId), inArray(expenseSplits.expenseId, expenseIds))
          )
      : [];
  const yourSplitMap = new Map(yourSplits.map((s) => [s.expenseId, s.owedAmountCents]));

  return rows.map((r) => ({
    kind: "expense",
    id: r.id,
    date: r.expenseDate,
    description: r.description,
    amountCents: r.amountCents,
    currency: r.currency,
    paidByName: r.paidByName,
    isPayer: r.paidBy === forUserId,
    yourShareCents: yourSplitMap.get(r.id),
  }));
}

export async function getExpenseWithSplits(expenseId: string) {
  const db = getDb();
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), isNull(expenses.deletedAt)))
    .limit(1);
  if (!expense) return null;

  const splits = await db
    .select()
    .from(expenseSplits)
    .where(eq(expenseSplits.expenseId, expenseId));

  return { expense, splits };
}
