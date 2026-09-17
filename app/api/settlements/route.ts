import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import { areAllGroupMembers } from "@/lib/db/queries/groups";
import { createSettlement } from "@/lib/db/queries/settlements";
import { createSettlementSchema } from "@/lib/validation/settlement-schema";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSettlementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.paidBy === input.paidTo) {
    return NextResponse.json(
      { error: "Cannot record a settlement with yourself" },
      { status: 400 }
    );
  }

  try {
    await assertGroupMember(input.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  const allMembers = await areAllGroupMembers(input.groupId, [input.paidBy, input.paidTo]);
  if (!allMembers) {
    return NextResponse.json(
      { error: "Both parties must be members of this group" },
      { status: 400 }
    );
  }

  const settlement = await createSettlement({
    groupId: input.groupId,
    paidBy: input.paidBy,
    paidTo: input.paidTo,
    amountCents: input.amountCents,
    currency: input.currency,
    note: input.note,
    createdBy: user.id,
  });

  return NextResponse.json({ settlement }, { status: 201 });
}
