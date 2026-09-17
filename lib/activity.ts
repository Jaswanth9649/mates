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
};

export type ActivityItem = ActivityExpenseItem | ActivitySettlementItem;
