import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import {
  deleteRecurringExpense,
  getRecurringExpenseById,
  setRecurringExpenseActive,
} from "@/lib/db/queries/recurring";

const patchSchema = z.object({ isActive: z.boolean() });

async function requireMembership(recurringId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const recurring = await getRecurringExpenseById(recurringId);
  if (!recurring) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  try {
    await assertGroupMember(recurring.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return { error: NextResponse.json({ error: e.message }, { status: 403 }) };
    }
    throw e;
  }

  return { recurring };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ recurringId: string }> }
) {
  const { recurringId } = await params;
  const result = await requireMembership(recurringId);
  if (result.error) return result.error;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setRecurringExpenseActive(recurringId, parsed.data.isActive);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ recurringId: string }> }
) {
  const { recurringId } = await params;
  const result = await requireMembership(recurringId);
  if (result.error) return result.error;

  await deleteRecurringExpense(recurringId);
  return NextResponse.json({ ok: true });
}
