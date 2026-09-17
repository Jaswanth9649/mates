import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { createGroup, getGroupsForUser } from "@/lib/db/queries/groups";
import { createGroupSchema } from "@/lib/validation/group-schema";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await getGroupsForUser(user.id);
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const group = await createGroup({
    name: parsed.data.name,
    currency: parsed.data.currency,
    createdByUserId: user.id,
  });

  return NextResponse.json({ group }, { status: 201 });
}
