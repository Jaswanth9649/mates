import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { assertGroupMember, ForbiddenError } from "@/lib/auth/authorize";
import { getExpenseWithSplits } from "@/lib/db/queries/expenses";
import { createExpenseComment, getExpenseComments } from "@/lib/db/queries/comments";
import { createCommentSchema } from "@/lib/validation/comment-schema";

export async function GET(
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

  const comments = await getExpenseComments(expenseId);
  return NextResponse.json({ comments });
}

export async function POST(
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
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await createExpenseComment(expenseId, user.id, parsed.data.body);
  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        authorId: user.id,
        authorName: user.displayName,
      },
    },
    { status: 201 }
  );
}
