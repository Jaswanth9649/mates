import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import { getSettlementById, softDeleteSettlement } from "@/lib/db/queries/settlements";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  const { settlementId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settlement = await getSettlementById(settlementId);
  if (!settlement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await assertGroupMember(settlement.groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  await softDeleteSettlement(settlementId);
  return NextResponse.json({ ok: true });
}
