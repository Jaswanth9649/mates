"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SplitEditor, type SplitEditorValue } from "@/components/expenses/split-editor";
import { dollarsToCents } from "@/lib/splits";
import type { Person } from "@/lib/mock-data";

const CATEGORIES = ["General", "Food", "Travel", "Lodging", "Utilities", "Rent", "Fun"];

export type ExpenseFormInitialValues = {
  expenseId: string;
  description: string;
  amountCents: number;
  category: string;
  expenseDate: string;
  paidBy: string;
  splitType: "equal" | "exact" | "percentage";
  splits: { userId: string; amountCents: number }[];
};

export function ExpenseForm({
  groupId,
  members,
  currency = "USD",
  defaultPaidBy,
  initial,
}: {
  groupId: string;
  members: Person[];
  currency?: string;
  defaultPaidBy: string;
  initial?: ExpenseFormInitialValues;
}) {
  const router = useRouter();
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [amount, setAmount] = React.useState(
    initial ? (initial.amountCents / 100).toFixed(2) : ""
  );
  const [category, setCategory] = React.useState(initial?.category ?? CATEGORIES[0]);
  const [paidBy, setPaidBy] = React.useState(initial?.paidBy ?? defaultPaidBy);
  const [date, setDate] = React.useState(
    initial?.expenseDate ?? (() => new Date().toISOString().slice(0, 10))()
  );
  const [splitValue, setSplitValue] = React.useState<SplitEditorValue | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const totalCents = dollarsToCents(amount || "0");
  const canSubmit =
    description.trim().length > 0 && totalCents > 0 && !!splitValue?.valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !splitValue) return;
    setSubmitting(true);

    const payload = {
      description,
      amountCents: totalCents,
      currency,
      category,
      expenseDate: date,
      paidBy,
      splitType: splitValue.splitType,
      splits: splitValue.splits,
    };

    try {
      const res = await fetch(
        initial ? `/api/expenses/${initial.expenseId}` : "/api/expenses",
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initial ? payload : { ...payload, groupId }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ? JSON.stringify(body.error) : "Request failed");
      }

      toast.success(`"${description}" ${initial ? "updated" : "added"}`);
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch {
      toast.error("Couldn't save that expense — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Dinner at Bæjarins Beztu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-6"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Paid by</Label>
              <Select value={paidBy} onValueChange={(value) => setPaidBy(value ?? "")}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => members.find((m) => m.id === value)?.name ?? value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? CATEGORIES[0])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Split</CardTitle>
        </CardHeader>
        <CardContent>
          <SplitEditor
            members={members}
            totalCents={totalCents}
            currency={currency}
            onChange={setSplitValue}
            initial={
              initial
                ? { splitType: initial.splitType, splits: initial.splits }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/groups/${groupId}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add expense"}
        </Button>
      </div>
    </form>
  );
}
