import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenses, expenseSplits, users } from "@/lib/db/schema";

export type Balance = { counterpart: { id: string; name: string }; netCents: number };

/**
 * Net pairwise balances for forUserId within a group, derived on read from
 * expense_splits (never stored redundantly — see lib/db/queries/expenses.ts
 * for why). Positive netCents means the counterpart owes forUserId;
 * negative means forUserId owes the counterpart.
 */
export async function computeGroupBalances(
  groupId: string,
  forUserId: string
): Promise<Balance[]> {
  const db = getDb();

  const rows = await db
    .select({
      splitUserId: expenseSplits.userId,
      paidBy: expenses.paidBy,
      owedAmountCents: expenseSplits.owedAmountCents,
    })
    .from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
    .where(and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)));

  const net = new Map<string, number>();
  const add = (userId: string, delta: number) =>
    net.set(userId, (net.get(userId) ?? 0) + delta);

  for (const row of rows) {
    if (row.splitUserId === row.paidBy) continue;
    if (row.paidBy === forUserId) {
      add(row.splitUserId, row.owedAmountCents);
    } else if (row.splitUserId === forUserId) {
      add(row.paidBy, -row.owedAmountCents);
    }
  }

  const counterpartIds = Array.from(net.keys()).filter((id) => net.get(id) !== 0);
  if (counterpartIds.length === 0) return [];

  const counterpartUsers = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(inArray(users.id, counterpartIds));

  return counterpartUsers.map((u) => ({
    counterpart: { id: u.id, name: u.displayName },
    netCents: net.get(u.id)!,
  }));
}
