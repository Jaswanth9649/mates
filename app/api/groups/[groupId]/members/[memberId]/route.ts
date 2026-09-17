import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupAdmin, ForbiddenError } from "@/lib/auth/authorize";
import { removeMember } from "@/lib/db/queries/groups";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  const { groupId, memberId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertGroupAdmin(groupId, user.id);
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  await removeMember(groupId, memberId);
  return NextResponse.json({ ok: true });
}
