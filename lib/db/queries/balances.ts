import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenses, expenseSplits, settlements, users } from "@/lib/db/schema";

export type Balance = {
  counterpart: { id: string; name: string };
  currency: string;
  netCents: number;
};

// Net balances are kept per (currency, counterpartId) — never merged across
// currencies. A friend who owes you money in a USD group and separately owes
// you money in an INR group has two independent balances, not one meaningless
// sum of USD cents and INR cents.
type NetKey = string;
function netKey(currency: string, counterpartId: string): NetKey {
  return `${currency}::${counterpartId}`;
}

function applyExpenseRows(
  net: Map<NetKey, number>,
  forUserId: string,
  rows: { splitUserId: string; paidBy: string; owedAmountCents: number; currency: string }[]
) {
  for (const row of rows) {
    if (row.splitUserId === row.paidBy) continue;
    if (row.paidBy === forUserId) {
      const key = netKey(row.currency, row.splitUserId);
      net.set(key, (net.get(key) ?? 0) + row.owedAmountCents);
    } else if (row.splitUserId === forUserId) {
      const key = netKey(row.currency, row.paidBy);
      net.set(key, (net.get(key) ?? 0) - row.owedAmountCents);
    }
  }
}

function applySettlementRows(
  net: Map<NetKey, number>,
  forUserId: string,
  rows: { paidBy: string; paidTo: string; amountCents: number; currency: string }[]
) {
  for (const row of rows) {
    if (row.paidBy === forUserId) {
      // I paid the counterpart: reduces what I owe them (or increases what they owe me).
      const key = netKey(row.currency, row.paidTo);
      net.set(key, (net.get(key) ?? 0) + row.amountCents);
    } else if (row.paidTo === forUserId) {
      // The counterpart paid me: reduces what they owe me (or increases what I owe them).
      const key = netKey(row.currency, row.paidBy);
      net.set(key, (net.get(key) ?? 0) - row.amountCents);
    }
  }
}

async function resolveCounterparts(net: Map<NetKey, number>): Promise<Balance[]> {
  const db = getDb();
  const entries = Array.from(net.entries()).filter(([, cents]) => cents !== 0);
  if (entries.length === 0) return [];

  const counterpartIds = Array.from(
    new Set(entries.map(([key]) => key.slice(key.indexOf("::") + 2)))
  );
  const counterpartUsers = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(inArray(users.id, counterpartIds));
  const nameById = new Map(counterpartUsers.map((u) => [u.id, u.displayName]));

  return entries.map(([key, netCents]) => {
    const separatorIndex = key.indexOf("::");
    const currency = key.slice(0, separatorIndex);
    const counterpartId = key.slice(separatorIndex + 2);
    return {
      counterpart: { id: counterpartId, name: nameById.get(counterpartId) ?? "Unknown" },
      currency,
      netCents,
    };
  });
}

/**
 * forUserId's single overall net position (summed across every
 * counterpart) in each of the given groups — the "settled / owed $X / you
 * owe $X" badge shown on group list cards. A group has one currency, so
 * summing across counterparts within it is always meaningful (unlike
 * computeAllBalancesForUser, which must keep currencies separate).
 */
export async function getGroupNetBalances(
  groupIds: string[],
  forUserId: string
): Promise<Map<string, number>> {
  const nets = await Promise.all(
    groupIds.map(async (groupId) => {
      const balances = await computeGroupBalances(groupId, forUserId);
      return [groupId, balances.reduce((sum, b) => sum + b.netCents, 0)] as const;
    })
  );
  return new Map(nets);
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
  const net = new Map<NetKey, number>();

  const expenseRows = await db
    .select({
      splitUserId: expenseSplits.userId,
      paidBy: expenses.paidBy,
      owedAmountCents: expenseSplits.owedAmountCents,
      currency: expenses.currency,
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
      currency: settlements.currency,
    })
    .from(settlements)
    .where(and(eq(settlements.groupId, groupId), isNull(settlements.deletedAt)));
  applySettlementRows(net, forUserId, settlementRows);

  return resolveCounterparts(net);
}

/**
 * Net pairwise balances for forUserId aggregated across every group they
 * belong to — used for the Friends view. Scans all expense_splits/
 * settlements involving forUserId directly rather than pre-listing their
 * groups, since a user can only appear in these rows for groups they're
 * actually a member of. Balances are kept separate per currency: a friend
 * sharing both a USD group and an INR group with you gets two rows, not one
 * incorrectly-summed number.
 */
export async function computeAllBalancesForUser(forUserId: string): Promise<Balance[]> {
  const db = getDb();
  const net = new Map<NetKey, number>();

  const expenseRows = await db
    .select({
      splitUserId: expenseSplits.userId,
      paidBy: expenses.paidBy,
      owedAmountCents: expenseSplits.owedAmountCents,
      currency: expenses.currency,
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
      currency: settlements.currency,
    })
    .from(settlements)
    .where(isNull(settlements.deletedAt));
  applySettlementRows(net, forUserId, settlementRows);

  return resolveCounterparts(net);
}
