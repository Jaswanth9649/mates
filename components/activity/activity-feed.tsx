import Link from "next/link";
import { Receipt, HandCoins, RefreshCw } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import type { ActivityItem } from "@/lib/activity";

export function ActivityFeed({
  items,
  getHref,
}: {
  items: ActivityItem[];
  getHref?: (item: ActivityItem) => string | undefined;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No activity yet — add your first expense to get started.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const href = getHref?.(item);
        const content = (
          <>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {item.kind === "expense" ? (
                item.isReceiptDerived ? (
                  <Receipt className="size-4" />
                ) : (
                  <RefreshCw className="size-4" />
                )
              ) : (
                <HandCoins className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {item.kind === "expense" ? (
                <>
                  <p className="truncate text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.paidByName} paid {formatCurrency(item.amountCents, item.currency)}
                    {" · "}
                    {formatDate(item.date)}
                  </p>
                </>
              ) : (
                <>
                  <p className="truncate text-sm font-medium">
                    {item.paidByName} paid {item.paidToName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Settlement{item.note ? ` · ${item.note}` : ""}
                    {" · "}
                    {formatDate(item.date)}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-semibold">
                {formatCurrency(item.amountCents, item.currency)}
              </span>
              {item.kind === "expense" && item.yourShareCents !== undefined && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  {item.isPayer ? "you lent" : "your share"}{" "}
                  {formatCurrency(item.yourShareCents, item.currency)}
                </Badge>
              )}
            </div>

            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">
                {initials(item.paidByName)}
              </AvatarFallback>
            </Avatar>
          </>
        );

        const className =
          "flex items-center gap-3 rounded-lg border border-border px-4 py-3" +
          (href ? " transition-colors hover:bg-accent/50" : "");

        return href ? (
          <li key={`${item.kind}-${item.id}`}>
            <Link href={href} className={className}>
              {content}
            </Link>
          </li>
        ) : (
          <li key={`${item.kind}-${item.id}`} className={className}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}
