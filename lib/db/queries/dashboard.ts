import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenses, expenseSplits, settlements, groups, users } from "@/lib/db/schema";
import type { ActivityItem } from "@/lib/activity";

/**
 * Recent expenses + settlements across the given groups, newest first,
 * capped at `limit` — the cross-group counterpart to
 * getGroupActivityForUser/getGroupSettlementsForActivity, which are scoped
 * to a single group. Each item carries groupName so the dashboard feed can
 * show which group it came from. Callers pass the groupIds forUserId
 * belongs to (the dashboard page already has these from getGroupsForUser)
 * rather than this function re-deriving them.
 */
export async function getRecentActivityForUser(
  forUserId: string,
  groupIds: string[],
  limit = 10
): Promise<ActivityItem[]> {
  if (groupIds.length === 0) return [];
  const db = getDb();

  const expenseRows = await db
    .select({
      id: expenses.id,
      description: expenses.description,
      amountCents: expenses.amountCents,
      currency: expenses.currency,
      expenseDate: expenses.expenseDate,
      paidBy: expenses.paidBy,
      paidByName: users.displayName,
      groupId: expenses.groupId,
      groupName: groups.name,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.paidBy, users.id))
    .innerJoin(groups, eq(expenses.groupId, groups.id))
    .where(and(inArray(expenses.groupId, groupIds), isNull(expenses.deletedAt)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt))
    .limit(limit);

  const expenseIds = expenseRows.map((r) => r.id);
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

  const expenseItems: ActivityItem[] = expenseRows.map((r) => ({
    kind: "expense",
    id: r.id,
    date: r.expenseDate,
    description: r.description,
    amountCents: r.amountCents,
    currency: r.currency,
    paidByName: r.paidByName,
    isPayer: r.paidBy === forUserId,
    yourShareCents: yourSplitMap.get(r.id),
    groupId: r.groupId,
    groupName: r.groupName,
  }));

  const paidByUsers = users;
  const settlementRows = await db
    .select({
      id: settlements.id,
      amountCents: settlements.amountCents,
      currency: settlements.currency,
      note: settlements.note,
      settledAt: settlements.settledAt,
      paidByName: paidByUsers.displayName,
      paidToId: settlements.paidTo,
      groupId: settlements.groupId,
      groupName: groups.name,
    })
    .from(settlements)
    .innerJoin(paidByUsers, eq(settlements.paidBy, paidByUsers.id))
    .innerJoin(groups, eq(settlements.groupId, groups.id))
    .where(and(inArray(settlements.groupId, groupIds), isNull(settlements.deletedAt)))
    .orderBy(desc(settlements.settledAt))
    .limit(limit);

  const paidToIds = Array.from(new Set(settlementRows.map((r) => r.paidToId)));
  const paidToRows =
    paidToIds.length > 0
      ? await db
          .select({ id: users.id, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, paidToIds))
      : [];
  const nameById = new Map(paidToRows.map((u) => [u.id, u.displayName]));

  const settlementItems: ActivityItem[] = settlementRows.map((r) => ({
    kind: "settlement",
    id: r.id,
    date: r.settledAt.toISOString(),
    amountCents: r.amountCents,
    currency: r.currency,
    paidByName: r.paidByName,
    paidToName: nameById.get(r.paidToId) ?? "Unknown",
    note: r.note ?? undefined,
    groupId: r.groupId,
    groupName: r.groupName,
  }));

  return [...expenseItems, ...settlementItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
