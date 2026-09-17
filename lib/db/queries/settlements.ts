import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { settlements, users } from "@/lib/db/schema";
import type { ActivitySettlementItem } from "@/lib/activity";

export type SettlementInput = {
  groupId: string;
  paidBy: string;
  paidTo: string;
  amountCents: number;
  currency: string;
  note?: string;
  createdBy: string;
};

export async function createSettlement(input: SettlementInput) {
  const db = getDb();
  const [settlement] = await db
    .insert(settlements)
    .values({
      groupId: input.groupId,
      paidBy: input.paidBy,
      paidTo: input.paidTo,
      amountCents: input.amountCents,
      currency: input.currency,
      note: input.note,
      createdBy: input.createdBy,
    })
    .returning();
  return settlement;
}

export async function getSettlementById(settlementId: string) {
  const db = getDb();
  const [settlement] = await db
    .select()
    .from(settlements)
    .where(and(eq(settlements.id, settlementId), isNull(settlements.deletedAt)))
    .limit(1);
  return settlement ?? null;
}

export async function softDeleteSettlement(settlementId: string) {
  const db = getDb();
  await db
    .update(settlements)
    .set({ deletedAt: new Date() })
    .where(eq(settlements.id, settlementId));
}

export async function getGroupSettlementsForActivity(
  groupId: string
): Promise<ActivitySettlementItem[]> {
  const db = getDb();
  const paidByUsers = users;

  const rows = await db
    .select({
      id: settlements.id,
      amountCents: settlements.amountCents,
      currency: settlements.currency,
      note: settlements.note,
      settledAt: settlements.settledAt,
      paidByName: paidByUsers.displayName,
      paidToId: settlements.paidTo,
    })
    .from(settlements)
    .innerJoin(paidByUsers, eq(settlements.paidBy, paidByUsers.id))
    .where(and(eq(settlements.groupId, groupId), isNull(settlements.deletedAt)))
    .orderBy(desc(settlements.settledAt));

  if (rows.length === 0) return [];

  const paidToIds = Array.from(new Set(rows.map((r) => r.paidToId)));
  const paidToRows = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(inArray(users.id, paidToIds));
  const nameById = new Map(paidToRows.map((u) => [u.id, u.displayName]));

  return rows.map((r) => ({
    kind: "settlement",
    id: r.id,
    date: r.settledAt.toISOString(),
    amountCents: r.amountCents,
    currency: r.currency,
    paidByName: r.paidByName,
    paidToName: nameById.get(r.paidToId) ?? "Unknown",
    note: r.note ?? undefined,
  }));
}
