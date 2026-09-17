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

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function RecurringForm({
  groupId,
  members,
  currency = "USD",
  defaultPaidBy,
}: {
  groupId: string;
  members: Person[];
  currency?: string;
  defaultPaidBy: string;
}) {
  const router = useRouter();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paidBy, setPaidBy] = React.useState(defaultPaidBy);
  const [frequency, setFrequency] = React.useState("monthly");
  const [startDate, setStartDate] = React.useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [splitValue, setSplitValue] = React.useState<SplitEditorValue | null>(null);

  const totalCents = dollarsToCents(amount || "0");
  const canSubmit =
    description.trim().length > 0 && totalCents > 0 && !!splitValue?.valid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: POST /api/recurring once lib/recurring/next-run.ts + the cron route exist.
    toast.success(`"${description}" will repeat ${frequency} (mock)`);
    router.push(`/groups/${groupId}/recurring`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Rent"
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
              <Label>Repeats</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value ?? "monthly")}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) =>
                      FREQUENCIES.find((f) => f.value === value)?.label ?? value
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="start-date">Starts</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
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
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/groups/${groupId}/recurring`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          Create schedule
        </Button>
      </div>
    </form>
  );
}
