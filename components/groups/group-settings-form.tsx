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
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currencies";

export function GroupSettingsForm({
  groupId,
  initialName,
  initialCurrency,
  hasExpenses,
}: {
  groupId: string;
  initialName: string;
  initialCurrency: CurrencyCode;
  hasExpenses: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [currency, setCurrency] = React.useState<CurrencyCode>(initialCurrency);
  const [saving, setSaving] = React.useState(false);

  const dirty = name !== initialName || currency !== initialCurrency;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency }),
      });
      if (!res.ok) throw new Error("Failed to update group");
      toast.success("Group updated");
      router.refresh();
    } catch {
      toast.error("Couldn't update the group — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Group settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-name">Group name</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Currency</Label>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency((value as CurrencyCode) ?? currency)}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: CurrencyCode) => {
                    const c = SUPPORTED_CURRENCIES.find((c) => c.code === value);
                    return c ? `${c.symbol} ${c.code} — ${c.label}` : value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasExpenses && currency !== initialCurrency && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            This group already has expenses in {initialCurrency}. Changing the currency
            only relabels future and existing amounts — it does not convert them.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || !name.trim() || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
