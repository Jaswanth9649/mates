import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenses, expenseSplits, settlements, users } from "@/lib/db/schema";

export type Balance = { counterpart: { id: string; name: string }; netCents: number };

function applyExpenseRows(
  net: Map<string, number>,
  forUserId: string,
  rows: { splitUserId: string; paidBy: string; owedAmountCents: number }[]
) {
  for (const row of rows) {
    if (row.splitUserId === row.paidBy) continue;
    if (row.paidBy === forUserId) {
      net.set(row.splitUserId, (net.get(row.splitUserId) ?? 0) + row.owedAmountCents);
    } else if (row.splitUserId === forUserId) {
      net.set(row.paidBy, (net.get(row.paidBy) ?? 0) - row.owedAmountCents);
    }
  }
}

function applySettlementRows(
  net: Map<string, number>,
  forUserId: string,
  rows: { paidBy: string; paidTo: string; amountCents: number }[]
) {
  for (const row of rows) {
    if (row.paidBy === forUserId) {
      // I paid the counterpart: reduces what I owe them (or increases what they owe me).
      net.set(row.paidTo, (net.get(row.paidTo) ?? 0) + row.amountCents);
    } else if (row.paidTo === forUserId) {
      // The counterpart paid me: reduces what they owe me (or increases what I owe them).
      net.set(row.paidBy, (net.get(row.paidBy) ?? 0) - row.amountCents);
    }
  }
}

async function resolveCounterparts(
  net: Map<string, number>,
  forUserId: string
): Promise<Balance[]> {
  const db = getDb();
  const counterpartIds = Array.from(net.keys()).filter(
    (id) => id !== forUserId && net.get(id) !== 0
  );
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

/**
 * Net pairwise balances for forUserId within a group, derived on read from
 * expense_splits and settlements (never stored redundantly). Positive
 * netCents means the counterpart owes forUserId; negative means forUserId
 * owes the counterpart.
 */
export async function computeGroupBalances(
  groupId: string,
  forUserId: string
): Promise<Balance[]> {
  const db = getDb();
  const net = new Map<string, number>();

  const expenseRows = await db
    .select({
      splitUserId: expenseSplits.userId,
      paidBy: expenses.paidBy,
      owedAmountCents: expenseSplits.owedAmountCents,
    })
    .from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
    .where(and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)));
  applyExpenseRows(net, forUserId, expenseRows);

  const settlementRows = await db
    .select({
      paidBy: settlements.paidBy,
      paidTo: settlements.paidTo,
      amountCents: settlements.amountCents,
    })
    .from(settlements)
    .where(and(eq(settlements.groupId, groupId), isNull(settlements.deletedAt)));
  applySettlementRows(net, forUserId, settlementRows);

  return resolveCounterparts(net, forUserId);
}

/**
 * Net pairwise balances for forUserId aggregated across every group they
 * belong to — used for the Friends view. Scans all expense_splits/
 * settlements involving forUserId directly rather than pre-listing their
 * groups, since a user can only appear in these rows for groups they're
 * actually a member of.
 */
export async function computeAllBalancesForUser(forUserId: string): Promise<Balance[]> {
  const db = getDb();
  const net = new Map<string, number>();

  const expenseRows = await db
    .select({
      splitUserId: expenseSplits.userId,
      paidBy: expenses.paidBy,
      owedAmountCents: expenseSplits.owedAmountCents,
    })
    .from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
    .where(isNull(expenses.deletedAt));
  applyExpenseRows(net, forUserId, expenseRows);

  const settlementRows = await db
    .select({
      paidBy: settlements.paidBy,
      paidTo: settlements.paidTo,
      amountCents: settlements.amountCents,
    })
    .from(settlements)
    .where(isNull(settlements.deletedAt));
  applySettlementRows(net, forUserId, settlementRows);

  return resolveCounterparts(net, forUserId);
}
