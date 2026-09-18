import { asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { expenseComments, users } from "@/lib/db/schema";

export type ExpenseCommentWithAuthor = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
};

export async function getExpenseComments(
  expenseId: string
): Promise<ExpenseCommentWithAuthor[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: expenseComments.id,
      body: expenseComments.body,
      createdAt: expenseComments.createdAt,
      authorId: expenseComments.userId,
      authorName: users.displayName,
    })
    .from(expenseComments)
    .innerJoin(users, eq(expenseComments.userId, users.id))
    .where(eq(expenseComments.expenseId, expenseId))
    .orderBy(asc(expenseComments.createdAt));

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function createExpenseComment(
  expenseId: string,
  userId: string,
  body: string
) {
  const db = getDb();
  const [comment] = await db
    .insert(expenseComments)
    .values({ expenseId, userId, body })
    .returning();
  return comment;
}

export async function getExpenseCommentById(commentId: string) {
  const db = getDb();
  const [comment] = await db
    .select()
    .from(expenseComments)
    .where(eq(expenseComments.id, commentId))
    .limit(1);
  return comment ?? null;
}

export async function deleteExpenseComment(commentId: string) {
  const db = getDb();
  await db.delete(expenseComments).where(eq(expenseComments.id, commentId));
}
