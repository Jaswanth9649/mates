export type ActivityExpenseItem = {
  kind: "expense";
  id: string;
  date: string;
  description: string;
  amountCents: number;
  currency: string;
  paidByName: string;
  isReceiptDerived?: boolean;
  isPayer: boolean;
  yourShareCents?: number;
  // Only set for the cross-group dashboard feed — the single-group activity
  // feed already has the group as context, so it's redundant there.
  groupId?: string;
  groupName?: string;
};

export type ActivitySettlementItem = {
  kind: "settlement";
  id: string;
  date: string;
  amountCents: number;
  currency: string;
  paidByName: string;
  paidToName: string;
  note?: string;
  groupId?: string;
  groupName?: string;
};

export type ActivityItem = ActivityExpenseItem | ActivitySettlementItem;
