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
import { formatCurrency } from "@/lib/format";
import type { Person } from "@/lib/mock-data";

type BalanceRow = { counterpart: Person; netCents: number };

export function SettleForm({
  groupId,
  balances,
  currency = "USD",
}: {
  groupId: string;
  balances: BalanceRow[];
  currency?: string;
}) {
  const router = useRouter();
  const [counterpartId, setCounterpartId] = React.useState(
    balances[0]?.counterpart.id ?? ""
  );
  const selected = balances.find((b) => b.counterpart.id === counterpartId);
  const [amount, setAmount] = React.useState(
    selected ? (Math.abs(selected.netCents) / 100).toFixed(2) : ""
  );
  const [note, setNote] = React.useState("");

  // Reset the prefilled amount when the counterpart changes, without an
  // effect: adjust state during render per the React docs pattern.
  const [lastCounterpartId, setLastCounterpartId] = React.useState(counterpartId);
  if (counterpartId !== lastCounterpartId) {
    setLastCounterpartId(counterpartId);
    setAmount(selected ? (Math.abs(selected.netCents) / 100).toFixed(2) : "");
  }

  if (balances.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        You&apos;re all settled up in this group — nothing to record.
      </div>
    );
  }

  const youOwe = selected ? selected.netCents < 0 : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/settlements once the database layer is wired up.
    toast.success(
      `Recorded ${formatCurrency(Number(amount) * 100, currency)} ${
        youOwe ? "to" : "from"
      } ${selected?.counterpart.name} (mock)`
    );
    router.push(`/groups/${groupId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Record a settlement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>With</Label>
            <Select value={counterpartId} onValueChange={(value) => setCounterpartId(value ?? "")}>
              <SelectTrigger>
                <SelectValue>
                  {(value: string) =>
                    balances.find((b) => b.counterpart.id === value)?.counterpart.name ??
                    value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {balances.map((b) => (
                  <SelectItem key={b.counterpart.id} value={b.counterpart.id}>
                    {b.counterpart.name} (
                    {b.netCents > 0 ? "owes you" : "you owe"}{" "}
                    {formatCurrency(Math.abs(b.netCents), currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settle-amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="settle-amount"
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {youOwe
                ? `You paid ${selected?.counterpart.name}`
                : `${selected?.counterpart.name} paid you`}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settle-note">Note (optional)</Label>
            <Input
              id="settle-note"
              placeholder="e.g. Venmo, cash"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/groups/${groupId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || Number(amount) <= 0}>
              Record settlement
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
