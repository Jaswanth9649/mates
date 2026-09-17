import { Receipt, HandCoins, RefreshCw } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import {
  CURRENT_USER_ID,
  getPerson,
  type ActivityItem,
} from "@/lib/mock-data";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No activity yet — add your first expense to get started.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={`${item.kind}-${item.id}`}
          className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {item.kind === "expense" && item.expense.receiptId ? (
              <Receipt className="size-4" />
            ) : item.kind === "expense" ? (
              item.expense.splitType === "line_item" ? (
                <Receipt className="size-4" />
              ) : (
                <RefreshCw className="size-4 rotate-0" />
              )
            ) : (
              <HandCoins className="size-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {item.kind === "expense" ? (
              <>
                <p className="truncate text-sm font-medium">
                  {item.expense.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getPerson(item.expense.paidBy).name === "You"
                    ? "You"
                    : getPerson(item.expense.paidBy).name}{" "}
                  paid {formatCurrency(item.expense.amountCents, item.expense.currency)}
                  {" · "}
                  {formatDate(item.date)}
                </p>
              </>
            ) : (
              <>
                <p className="truncate text-sm font-medium">
                  {getPerson(item.settlement.paidBy).name} paid{" "}
                  {getPerson(item.settlement.paidTo).name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Settlement{item.settlement.note ? ` · ${item.settlement.note}` : ""}
                  {" · "}
                  {formatDate(item.date)}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold">
              {formatCurrency(
                item.kind === "expense"
                  ? item.expense.amountCents
                  : item.settlement.amountCents,
                item.kind === "expense" ? item.expense.currency : "USD"
              )}
            </span>
            {item.kind === "expense" && (
              <YourShareBadge item={item} />
            )}
          </div>

          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">
              {initials(
                getPerson(
                  item.kind === "expense"
                    ? item.expense.paidBy
                    : item.settlement.paidBy
                ).name
              )}
            </AvatarFallback>
          </Avatar>
        </li>
      ))}
    </ul>
  );
}

function YourShareBadge({
  item,
}: {
  item: Extract<ActivityItem, { kind: "expense" }>;
}) {
  const yourSplit = item.expense.splits.find((s) => s.userId === CURRENT_USER_ID);
  if (!yourSplit) return null;
  const isPayer = item.expense.paidBy === CURRENT_USER_ID;
  return (
    <Badge variant="outline" className="text-[10px] font-normal">
      {isPayer ? "you lent" : "your share"}{" "}
      {formatCurrency(yourSplit.amountCents, item.expense.currency)}
    </Badge>
  );
}
