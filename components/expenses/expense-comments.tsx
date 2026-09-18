"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, initials } from "@/lib/format";

export type ExpenseCommentItem = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
};

export function ExpenseComments({
  expenseId,
  currentUserId,
  initialComments,
}: {
  expenseId: string;
  currentUserId: string;
  initialComments: ExpenseCommentItem[];
}) {
  const router = useRouter();
  const [comments, setComments] = React.useState(initialComments);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/expenses/${expenseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!res.ok) throw new Error("Request failed");
      const { comment } = await res.json();
      setComments((prev) => [...prev, comment]);
      setBody("");
      router.refresh();
    } catch {
      toast.error("Couldn't post that comment — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/expenses/${expenseId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Request failed");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    } catch {
      toast.error("Couldn't delete that comment — try again");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet — say something about this expense.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {initials(comment.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground/90">
                  {comment.body}
                </p>
              </div>
              {comment.authorId === currentUserId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground"
                  disabled={deletingId === comment.id}
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Delete comment"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          rows={2}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!body.trim() || submitting}>
            {submitting ? "Posting…" : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
