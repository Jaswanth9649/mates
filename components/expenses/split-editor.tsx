"use client";

import * as React from "react";
import { Check, AlertCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency, initials } from "@/lib/format";
import { splitEqually, splitByPercentage, dollarsToCents } from "@/lib/splits";
import type { Person } from "@/lib/mock-data";

export type SplitEditorValue = {
  splitType: "equal" | "exact" | "percentage";
  splits: { userId: string; amountCents: number }[];
  valid: boolean;
};

export type SplitEditorInitial = {
  splitType: "equal" | "exact" | "percentage";
  splits: { userId: string; amountCents: number }[];
};

export function SplitEditor({
  members,
  totalCents,
  currency = "USD",
  onChange,
  initial,
}: {
  members: Person[];
  totalCents: number;
  currency?: string;
  onChange?: (value: SplitEditorValue) => void;
  initial?: SplitEditorInitial;
}) {
  const [splitType, setSplitType] = React.useState<
    "equal" | "exact" | "percentage"
  >(initial?.splitType ?? "equal");
  const [participantIds, setParticipantIds] = React.useState<Set<string>>(() =>
    initial
      ? new Set(initial.splits.map((s) => s.userId))
      : new Set(members.map((m) => m.id))
  );
  const [exactInputs, setExactInputs] = React.useState<Record<string, string>>(() =>
    initial
      ? Object.fromEntries(
          initial.splits.map((s) => [s.userId, (s.amountCents / 100).toFixed(2)])
        )
      : {}
  );
  const [percentInputs, setPercentInputs] = React.useState<Record<string, string>>(() => {
    if (initial && initial.splitType === "percentage" && totalCents > 0) {
      return Object.fromEntries(
        initial.splits.map((s) => [s.userId, ((s.amountCents / totalCents) * 100).toFixed(1)])
      );
    }
    return Object.fromEntries(
      members.map((m) => [m.id, (100 / members.length).toFixed(1)])
    );
  });

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const participants = React.useMemo(
    () => members.filter((m) => participantIds.has(m.id)),
    [members, participantIds]
  );

  const { splits, valid, assignedCents } = React.useMemo(() => {
    if (splitType === "equal") {
      const map = splitEqually(
        totalCents,
        participants.map((p) => p.id)
      );
      const splits = Object.entries(map).map(([userId, amountCents]) => ({
        userId,
        amountCents,
      }));
      return { splits, valid: participants.length > 0, assignedCents: totalCents };
    }

    if (splitType === "exact") {
      const splits = participants.map((p) => ({
        userId: p.id,
        amountCents: dollarsToCents(exactInputs[p.id] ?? "0"),
      }));
      const assignedCents = splits.reduce((sum, s) => sum + s.amountCents, 0);
      return {
        splits,
        valid: participants.length > 0 && assignedCents === totalCents,
        assignedCents,
      };
    }

    // percentage
    const percentValues = participants.map((p) => ({
      id: p.id,
      percent: Number.parseFloat(percentInputs[p.id] ?? "0") || 0,
    }));
    const totalPercent = percentValues.reduce((sum, p) => sum + p.percent, 0);
    const map = splitByPercentage(totalCents, percentValues);
    const splits = Object.entries(map).map(([userId, amountCents]) => ({
      userId,
      amountCents,
    }));
    const assignedCents = splits.reduce((sum, s) => sum + s.amountCents, 0);
    return {
      splits,
      valid: participants.length > 0 && Math.abs(totalPercent - 100) < 0.01,
      assignedCents,
    };
  }, [splitType, participants, exactInputs, percentInputs, totalCents]);

  React.useEffect(() => {
    onChange?.({ splitType, splits, valid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitType, splits, valid]);

  const splitMap = React.useMemo(
    () => new Map(splits.map((s) => [s.userId, s.amountCents])),
    [splits]
  );

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={splitType} onValueChange={(v) => setSplitType(v as typeof splitType)}>
        <TabsList>
          <TabsTrigger value="equal">Equal</TabsTrigger>
          <TabsTrigger value="exact">Exact amounts</TabsTrigger>
          <TabsTrigger value="percentage">Percentage</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {members.map((member) => {
          const included = participantIds.has(member.id);
          return (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                !included && "opacity-50"
              )}
            >
              {splitType === "equal" ? (
                <button
                  type="button"
                  onClick={() => toggleParticipant(member.id)}
                  className={cn(
                    "flex size-5 items-center justify-center rounded border border-border",
                    included && "border-primary bg-primary text-primary-foreground"
                  )}
                  aria-label={`${included ? "Remove" : "Include"} ${member.name}`}
                >
                  {included && <Check className="size-3" />}
                </button>
              ) : (
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
              )}

              <span className="flex-1 text-sm font-medium">{member.name}</span>

              {splitType === "equal" && (
                <span className="text-sm text-muted-foreground">
                  {included
                    ? formatCurrency(splitMap.get(member.id) ?? 0, currency)
                    : "—"}
                </span>
              )}

              {splitType === "exact" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-24 text-right"
                    value={exactInputs[member.id] ?? ""}
                    onChange={(e) =>
                      setExactInputs((prev) => ({
                        ...prev,
                        [member.id]: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

              {splitType === "percentage" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-20 text-right"
                    value={percentInputs[member.id] ?? ""}
                    onChange={(e) =>
                      setPercentInputs((prev) => ({
                        ...prev,
                        [member.id]: e.target.value,
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <span className="w-16 text-right text-sm text-muted-foreground">
                    {formatCurrency(splitMap.get(member.id) ?? 0, currency)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {splitType !== "equal" && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
            valid
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400"
          )}
        >
          {valid ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
          {splitType === "exact"
            ? `${formatCurrency(assignedCents, currency)} of ${formatCurrency(totalCents, currency)} assigned`
            : `${participants
                .reduce((sum, p) => sum + (Number.parseFloat(percentInputs[p.id] ?? "0") || 0), 0)
                .toFixed(1)}% of 100% assigned`}
        </div>
      )}
    </div>
  );
}
