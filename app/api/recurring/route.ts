import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import { areAllGroupMembers } from "@/lib/db/queries/groups";
import { createRecurringExpense } from "@/lib/db/queries/recurring";
import { createRecurringExpenseSchema } from "@/lib/validation/recurring-schema";

const bodySchema = createRecurringExpenseSchema.extend({ groupId: z.string().uuid() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    await assertGroupMember(input.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  const memberIds = [input.paidBy, ...input.splits.map((s) => s.userId)];
  const allMembers = await areAllGroupMembers(input.groupId, memberIds);
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

  const recurring = await createRecurringExpense({
    groupId: input.groupId,
    paidBy: input.paidBy,
    description: input.description,
    amountCents: input.amountCents,
    currency: input.currency,
    category: input.category,
    splitType: input.splitType,
    frequency: input.frequency,
    startDate: input.startDate,
    splits: input.splits,
    createdBy: user.id,
  });

  return NextResponse.json({ recurring }, { status: 201 });
}
