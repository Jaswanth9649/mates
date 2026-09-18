import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteExpenseComment, getExpenseCommentById } from "@/lib/db/queries/comments";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ expenseId: string; commentId: string }> }
) {
  const { expenseId, commentId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await getExpenseCommentById(commentId);
  if (!comment || comment.expenseId !== expenseId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the author can delete their own comment.
  if (comment.userId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own comments" }, { status: 403 });
  }

  await deleteExpenseComment(commentId);
  return NextResponse.json({ ok: true });
}
