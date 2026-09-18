import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, initials } from "@/lib/format";

type BalanceRow = {
  counterpart: { id: string; name: string };
  currency: string;
  netCents: number;
};

/**
 * Renders one panel per currency present in `items`, so balances in
 * different currencies (e.g. a USD group and an INR group with the same
 * friend) are never added together into a meaningless total. Most callers
 * only ever have a single currency — that case renders exactly as it
 * always has, just with an implicit single panel.
 */
export function BalanceSummary({
  items,
  settleHref,
}: {
  items: BalanceRow[];
  settleHref?: (counterpartId: string, currency: string) => string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        All settled up here — no outstanding balances.
      </div>
    );
  }

  const byCurrency = new Map<string, BalanceRow[]>();
  for (const item of items) {
    const group = byCurrency.get(item.currency) ?? [];
    group.push(item);
    byCurrency.set(item.currency, group);
  }
  const currencies = Array.from(byCurrency.keys()).sort();

  return (
    <div className="flex flex-col gap-4">
      {currencies.map((currency) => {
        const rows = byCurrency.get(currency)!;
        const totalNet = rows.reduce((sum, i) => sum + i.netCents, 0);

        return (
          <div key={currency} className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                {currencies.length > 1 ? `Overall (${currency})` : "Overall"}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  totalNet > 0 && "text-emerald-600 dark:text-emerald-400",
                  totalNet < 0 && "text-red-600 dark:text-red-400"
                )}
              >
                {totalNet === 0
                  ? "Settled up"
                  : totalNet > 0
                    ? `You are owed ${formatCurrency(totalNet, currency)}`
                    : `You owe ${formatCurrency(totalNet, currency)}`}
              </span>
            </div>

            <ul className="divide-y divide-border">
              {rows.map(({ counterpart, netCents }) => (
                <li
                  key={counterpart.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar className="size-9">
                    <AvatarFallback>{initials(counterpart.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {counterpart.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        netCents > 0 && "text-emerald-600 dark:text-emerald-400",
                        netCents < 0 && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {netCents > 0
                        ? `owes you ${formatCurrency(netCents, currency)}`
                        : `you owe ${formatCurrency(netCents, currency)}`}
                    </p>
                  </div>
                  {settleHref && (
                    <Button
                      render={<Link href={settleHref(counterpart.id, currency)} />}
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                    >
                      Settle up
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
