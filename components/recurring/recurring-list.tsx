"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pause, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export type RecurringListItem = {
  id: string;
  description: string;
  amountCents: number;
  currency: string;
  frequency: "weekly" | "monthly";
  nextRunDate: string;
  isActive: boolean;
  paidByName: string;
};

export function RecurringList({ items }: { items: RecurringListItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const toggleActive = async (item: RecurringListItem) => {
    setPendingId(item.id);
    try {
      const res = await fetch(`/api/recurring/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success(item.isActive ? `"${item.description}" paused` : `"${item.description}" resumed`);
      router.refresh();
    } catch {
      toast.error("Couldn't update that schedule — try again");
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (item: RecurringListItem) => {
    if (!window.confirm(`Delete the "${item.description}" schedule? This won't remove expenses already created from it.`)) {
      return;
    }
    setPendingId(item.id);
    try {
      const res = await fetch(`/api/recurring/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Request failed");
      toast.success(`"${item.description}" deleted`);
      router.refresh();
    } catch {
      toast.error("Couldn't delete that schedule — try again");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const pending = pendingId === item.id;
        return (
          <Card key={item.id} className={!item.isActive ? "opacity-60" : undefined}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.amountCents, item.currency)} · {item.frequency} · paid by{" "}
                  {item.paidByName} · next on {item.nextRunDate}
                  {!item.isActive && " · paused"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => toggleActive(item)}
                >
                  {item.isActive ? (
                    <>
                      <Pause className="size-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" /> Resume
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => remove(item)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
