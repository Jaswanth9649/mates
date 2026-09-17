import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import { areAllGroupMembers } from "@/lib/db/queries/groups";
import {
  getExpenseWithSplits,
  softDeleteExpense,
  updateExpense,
} from "@/lib/db/queries/expenses";
import { updateExpenseSchema } from "@/lib/validation/expense-schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const { expenseId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getExpenseWithSplits(expenseId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await assertGroupMember(result.expense.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  return NextResponse.json(result);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const { expenseId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getExpenseWithSplits(expenseId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await assertGroupMember(existing.expense.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  const body = await req.json().catch(() => null);
  const parsed = updateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const memberIds = [input.paidBy, ...input.splits.map((s) => s.userId)];
  const allMembers = await areAllGroupMembers(existing.expense.groupId, memberIds);
  if (!allMembers) {
    return NextResponse.json(
      { error: "All participants must be members of this group" },
      { status: 400 }
    );
  }

  const totalSplit = input.splits.reduce((sum, s) => sum + s.amountCents, 0);
  if (totalSplit !== input.amountCents) {
    return NextResponse.json(
      { error: "Splits do not sum to the expense total" },
      { status: 400 }
    );
  }

  await updateExpense(expenseId, {
    paidBy: input.paidBy,
    description: input.description,
    amountCents: input.amountCents,
    currency: input.currency,
    category: input.category,
    expenseDate: input.expenseDate,
    splitType: input.splitType,
    splits: input.splits,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const { expenseId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getExpenseWithSplits(expenseId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await assertGroupMember(existing.expense.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  await softDeleteExpense(expenseId);
  return NextResponse.json({ ok: true });
}
