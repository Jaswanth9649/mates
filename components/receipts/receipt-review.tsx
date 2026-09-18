"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Receipt as ReceiptIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, initials } from "@/lib/format";
import { dollarsToCents } from "@/lib/splits";
import type { Person } from "@/lib/mock-data";

export type ReviewLineItem = {
  id: string;
  description: string;
  amountCents: number;
  confidence: number;
};

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export function ReceiptReview({
  groupId,
  members,
  currency = "USD",
  defaultPaidBy,
  merchantName,
  totalAmountCents,
  overallConfidence,
  initialLineItems,
}: {
  groupId: string;
  members: Person[];
  currency?: string;
  defaultPaidBy: string;
  merchantName: string;
  totalAmountCents: number;
  overallConfidence: number;
  initialLineItems: ReviewLineItem[];
}) {
  const router = useRouter();
  const [lineItems, setLineItems] = React.useState(initialLineItems);
  const [paidBy, setPaidBy] = React.useState(defaultPaidBy);
  const [submitting, setSubmitting] = React.useState(false);
  const [assignments, setAssignments] = React.useState<Record<string, Set<string>>>(
    () =>
      Object.fromEntries(
        initialLineItems.map((item) => [item.id, new Set(members.map((m) => m.id))])
      )
  );

  const lowConfidence = overallConfidence < LOW_CONFIDENCE_THRESHOLD;

  const updateItem = (id: string, patch: Partial<ReviewLineItem>) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const toggleAssignee = (itemId: string, memberId: string) => {
    setAssignments((prev) => {
      const next = new Set(prev[itemId] ?? []);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return { ...prev, [itemId]: next };
    });
  };

  const extractedTotal = lineItems.reduce((sum, i) => sum + i.amountCents, 0);
  const totalsMismatch = extractedTotal !== totalAmountCents;

  const perMemberTotals = React.useMemo(() => {
    const totals = new Map<string, number>(members.map((m) => [m.id, 0]));
    for (const item of lineItems) {
      const assignees = Array.from(assignments[item.id] ?? []);
      if (assignees.length === 0) continue;
      const base = Math.floor(item.amountCents / assignees.length);
      const remainder = item.amountCents - base * assignees.length;
      assignees.forEach((id, i) => {
        totals.set(id, (totals.get(id) ?? 0) + base + (i < remainder ? 1 : 0));
      });
    }
    return totals;
  }, [lineItems, assignments, members]);

  const hasUnassignedItem = lineItems.some(
    (item) => (assignments[item.id]?.size ?? 0) === 0
  );

  const handleCreateExpense = async () => {
    if (hasUnassignedItem || submitting) return;
    setSubmitting(true);

    const splits = members.map((member) => ({
      userId: member.id,
      amountCents: perMemberTotals.get(member.id) ?? 0,
    }));

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          description: merchantName,
          amountCents: extractedTotal,
          currency,
          expenseDate: new Date().toISOString().slice(0, 10),
          paidBy,
          splitType: "line_item",
          splits,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ? JSON.stringify(body.error) : "Request failed");
      }

      toast.success(`Expense created from ${merchantName} receipt`);
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch {
      toast.error("Couldn't create that expense — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {lowConfidence && (
        <div className="flex items-start gap-3 rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            We couldn&apos;t confidently read this receipt — double-check the
            highlighted amounts below before creating the expense.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
          <ReceiptIcon className="size-8" />
          <span className="text-xs">receipt photo</span>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{merchantName}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Detected total: {formatCurrency(totalAmountCents)}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 pt-0">
              <div className="flex flex-col divide-y divide-border">
                {lineItems.map((item) => {
                  const itemLowConfidence = item.confidence < LOW_CONFIDENCE_THRESHOLD;
                  const assignees = assignments[item.id] ?? new Set<string>();
                  return (
                    <div key={item.id} className="flex flex-col gap-2 py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, { description: e.target.value })
                          }
                          className={cn(
                            "flex-1",
                            itemLowConfidence &&
                              "border-amber-400 focus-visible:ring-amber-400"
                          )}
                        />
                        <div className="relative">
                          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className={cn(
                              "w-24 pl-5 text-right",
                              itemLowConfidence &&
                                "border-amber-400 focus-visible:ring-amber-400"
                            )}
                            value={(item.amountCents / 100).toFixed(2)}
                            onChange={(e) =>
                              updateItem(item.id, {
                                amountCents: dollarsToCents(e.target.value),
                              })
                            }
                          />
                        </div>
                        {itemLowConfidence && (
                          <span
                            title="Low confidence extraction"
                            className="size-2 shrink-0 rounded-full bg-amber-500"
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pl-0.5">
                        <span className="text-xs text-muted-foreground">Split:</span>
                        {members.map((member) => {
                          const active = assignees.has(member.id);
                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => toggleAssignee(item.id, member.id)}
                              className={cn(
                                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                                active
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border text-muted-foreground hover:bg-accent"
                              )}
                            >
                              <Avatar className="size-4">
                                <AvatarFallback className="text-[8px]">
                                  {initials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              {member.name.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Sum of line items</span>
                <span
                  className={cn(
                    "font-medium",
                    totalsMismatch && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {formatCurrency(extractedTotal)}
                  {totalsMismatch && " (doesn't match detected total)"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Per-person share
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between text-sm">
                  <span>{member.name}</span>
                  <span className="font-medium">
                    {formatCurrency(perMemberTotals.get(member.id) ?? 0)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="receipt-paid-by" className="text-sm text-muted-foreground">
              Paid by
            </Label>
            <Select value={paidBy} onValueChange={(value) => setPaidBy(value ?? paidBy)}>
              <SelectTrigger id="receipt-paid-by" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
        >
          Skip OCR, enter manually
        </Button>
        <Button onClick={handleCreateExpense} disabled={hasUnassignedItem || submitting}>
          {submitting ? "Creating…" : "Create expense"}
        </Button>
      </div>
    </div>
  );
}
