import { randomUUID } from "node:crypto";
import { and, eq, lte } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  recurringExpenses,
  recurringExpenseSplits,
  users,
  type RecurringExpense,
} from "@/lib/db/schema";
import {
  createExpense,
  assertSplitsSumToTotal,
  type ExpenseSplitInput,
} from "@/lib/db/queries/expenses";
import { nextRunDate } from "@/lib/recurring/next-run";

export type RecurringExpenseInput = {
  groupId: string;
  paidBy: string;
  description: string;
  amountCents: number;
  currency: string;
  category?: string;
  splitType: "equal" | "exact" | "percentage";
  frequency: "weekly" | "monthly";
  startDate: string;
  splits: ExpenseSplitInput[];
  createdBy: string;
};

export async function createRecurringExpense(
  input: RecurringExpenseInput
): Promise<RecurringExpense> {
  assertSplitsSumToTotal(input.amountCents, input.splits);

  const db = getDb();
  const recurringExpenseId = randomUUID();

  const [inserted] = await db.batch([
    db
      .insert(recurringExpenses)
      .values({
        id: recurringExpenseId,
        groupId: input.groupId,
        paidBy: input.paidBy,
        description: input.description,
        amountCents: input.amountCents,
        currency: input.currency,
        category: input.category,
        splitType: input.splitType,
        frequency: input.frequency,
        nextRunDate: input.startDate,
        createdBy: input.createdBy,
      })
      .returning(),
    ...input.splits.map((split) =>
      db.insert(recurringExpenseSplits).values({
        recurringExpenseId,
        userId: split.userId,
        owedAmountCents: split.amountCents,
      })
    ),
  ]);

  return inserted[0];
}

export async function getGroupRecurringExpenses(groupId: string) {
  const db = getDb();
  const rows = await db
    .select({
      recurring: recurringExpenses,
      paidByName: users.displayName,
    })
    .from(recurringExpenses)
    .innerJoin(users, eq(recurringExpenses.paidBy, users.id))
    .where(eq(recurringExpenses.groupId, groupId))
    .orderBy(recurringExpenses.createdAt);

  return rows.map((r) => ({ ...r.recurring, paidByName: r.paidByName }));
}

export async function getRecurringExpenseById(recurringExpenseId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(recurringExpenses)
    .where(eq(recurringExpenses.id, recurringExpenseId))
    .limit(1);
  return row ?? null;
}

export async function setRecurringExpenseActive(
  recurringExpenseId: string,
  isActive: boolean
) {
  const db = getDb();
  await db
    .update(recurringExpenses)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(recurringExpenses.id, recurringExpenseId));
}

export async function deleteRecurringExpense(recurringExpenseId: string) {
  const db = getDb();
  await db.delete(recurringExpenses).where(eq(recurringExpenses.id, recurringExpenseId));
}

/** Every active schedule whose nextRunDate is today or earlier. */
export async function getDueRecurringExpenses(todayDateStr: string) {
  const db = getDb();
  return db
    .select()
    .from(recurringExpenses)
    .where(
      and(
        eq(recurringExpenses.isActive, true),
        lte(recurringExpenses.nextRunDate, todayDateStr)
      )
    );
}

/**
 * Materializes one due recurring schedule into a real expense dated on its
 * nextRunDate, then advances the schedule's nextRunDate by one occurrence.
 * Called by the daily cron route — safe to call more than once for the
 * same schedule on the same day since it always re-reads nextRunDate first
 * (the caller should re-fetch between calls if processing in a loop).
 */
export async function materializeRecurringExpense(recurring: RecurringExpense) {
  const db = getDb();

  const splits = await db
    .select({ userId: recurringExpenseSplits.userId, owedAmountCents: recurringExpenseSplits.owedAmountCents })
    .from(recurringExpenseSplits)
    .where(eq(recurringExpenseSplits.recurringExpenseId, recurring.id));

  const expense = await createExpense({
    groupId: recurring.groupId,
    paidBy: recurring.paidBy,
    description: recurring.description,
    amountCents: recurring.amountCents,
    currency: recurring.currency,
    category: recurring.category ?? undefined,
    expenseDate: recurring.nextRunDate,
    splitType: recurring.splitType,
    splits: splits.map((s) => ({ userId: s.userId, amountCents: s.owedAmountCents })),
    createdBy: recurring.createdBy,
  });

  const advancedDate = nextRunDate(recurring.nextRunDate, recurring.frequency);
  await db
    .update(recurringExpenses)
    .set({ nextRunDate: advancedDate, updatedAt: new Date() })
    .where(eq(recurringExpenses.id, recurring.id));

  return { expense, advancedDate };
}
