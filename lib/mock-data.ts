// Placeholder in-memory data for building the UI before the database/auth layer
// (Neon + Drizzle + Clerk) is wired up. Shapes intentionally mirror the planned
// schema (lib/db/schema.ts) so swapping this for real queries later is mechanical.

export type Person = {
  id: string;
  name: string;
  email: string;
};

export type SplitType = "equal" | "exact" | "percentage" | "line_item";

export type Expense = {
  id: string;
  groupId: string;
  description: string;
  amountCents: number;
  currency: string;
  category: string;
  paidBy: string;
  date: string; // ISO date
  splitType: SplitType;
  splits: { userId: string; amountCents: number }[];
  receiptId?: string;
};

export type Settlement = {
  id: string;
  groupId: string;
  paidBy: string;
  paidTo: string;
  amountCents: number;
  date: string;
  note?: string;
};

export type Group = {
  id: string;
  name: string;
  currency: string;
  memberIds: string[];
};

export const CURRENT_USER_ID = "u1";

export const PEOPLE: Person[] = [
  { id: "u1", name: "You", email: "you@example.com" },
  { id: "u2", name: "Alex Chen", email: "alex@example.com" },
  { id: "u3", name: "Priya Rao", email: "priya@example.com" },
  { id: "u4", name: "Sam Torres", email: "sam@example.com" },
];

export const GROUPS: Group[] = [
  { id: "g1", name: "Iceland Trip 2026", currency: "USD", memberIds: ["u1", "u2", "u3"] },
  { id: "g2", name: "Apartment 4B", currency: "USD", memberIds: ["u1", "u4"] },
  { id: "g3", name: "Weekend BBQ", currency: "USD", memberIds: ["u1", "u2", "u4"] },
];

export const EXPENSES: Expense[] = [
  {
    id: "e1",
    groupId: "g1",
    description: "Flights to Reykjavik",
    amountCents: 128700,
    currency: "USD",
    category: "Travel",
    paidBy: "u1",
    date: "2026-09-02",
    splitType: "equal",
    splits: [
      { userId: "u1", amountCents: 42900 },
      { userId: "u2", amountCents: 42900 },
      { userId: "u3", amountCents: 42900 },
    ],
  },
  {
    id: "e2",
    groupId: "g1",
    description: "Airbnb - 4 nights",
    amountCents: 96000,
    currency: "USD",
    category: "Lodging",
    paidBy: "u2",
    date: "2026-09-05",
    splitType: "equal",
    splits: [
      { userId: "u1", amountCents: 32000 },
      { userId: "u2", amountCents: 32000 },
      { userId: "u3", amountCents: 32000 },
    ],
  },
  {
    id: "e3",
    groupId: "g1",
    description: "Groceries - Bonus supermarket",
    amountCents: 8734,
    currency: "USD",
    category: "Food",
    paidBy: "u3",
    date: "2026-09-06",
    splitType: "line_item",
    receiptId: "r1",
    splits: [
      { userId: "u1", amountCents: 2678 },
      { userId: "u2", amountCents: 3156 },
      { userId: "u3", amountCents: 2900 },
    ],
  },
  {
    id: "e4",
    groupId: "g2",
    description: "September Rent",
    amountCents: 240000,
    currency: "USD",
    category: "Rent",
    paidBy: "u4",
    date: "2026-09-01",
    splitType: "equal",
    splits: [
      { userId: "u1", amountCents: 120000 },
      { userId: "u4", amountCents: 120000 },
    ],
  },
  {
    id: "e5",
    groupId: "g2",
    description: "Internet - Comcast",
    amountCents: 8000,
    currency: "USD",
    category: "Utilities",
    paidBy: "u1",
    date: "2026-09-03",
    splitType: "equal",
    splits: [
      { userId: "u1", amountCents: 4000 },
      { userId: "u4", amountCents: 4000 },
    ],
  },
  {
    id: "e6",
    groupId: "g3",
    description: "Burgers & buns - Trader Joe's",
    amountCents: 6420,
    currency: "USD",
    category: "Food",
    paidBy: "u1",
    date: "2026-09-10",
    splitType: "equal",
    splits: [
      { userId: "u1", amountCents: 2140 },
      { userId: "u2", amountCents: 2140 },
      { userId: "u4", amountCents: 2140 },
    ],
  },
];

export const SETTLEMENTS: Settlement[] = [
  {
    id: "s1",
    groupId: "g2",
    paidBy: "u1",
    paidTo: "u4",
    amountCents: 60000,
    date: "2026-09-08",
    note: "Venmo",
  },
];

export const RECEIPT_MOCK = {
  id: "r1",
  merchantName: "Bónus Supermarket",
  totalAmountCents: 8734,
  imageAlt: "Grocery store receipt",
  confidence: 0.62,
  lineItems: [
    { id: "li1", description: "Skyr 4-pack", amountCents: 1290, quantity: 1, confidence: 0.91 },
    { id: "li2", description: "Lamb hot dogs", amountCents: 2156, quantity: 2, confidence: 0.88 },
    { id: "li3", description: "Rye bread", amountCents: 890, quantity: 1, confidence: 0.94 },
    { id: "li4", description: "Local coffee", amountCents: 1548, quantity: 1, confidence: 0.55 },
    { id: "li5", description: "Skyr smoothies", amountCents: 2850, quantity: 3, confidence: 0.4 },
  ],
};

function personById(id: string) {
  return PEOPLE.find((p) => p.id === id)!;
}

export const getPerson = personById;

export function getGroup(groupId: string) {
  return GROUPS.find((g) => g.id === groupId);
}

export function getGroupMembers(groupId: string): Person[] {
  const group = getGroup(groupId);
  if (!group) return [];
  return group.memberIds.map(personById);
}

export function getGroupExpenses(groupId: string) {
  return EXPENSES.filter((e) => e.groupId === groupId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function getGroupSettlements(groupId: string) {
  return SETTLEMENTS.filter((s) => s.groupId === groupId);
}

/**
 * Net pairwise balances, mirroring the planned `pairwise_balances` DB view:
 * positive netCents means `counterpart` owes `forUserId`; negative means the reverse.
 */
export function computeBalances(opts: {
  forUserId: string;
  groupId?: string;
}): { counterpart: Person; netCents: number }[] {
  const { forUserId, groupId } = opts;
  const expenses = groupId ? EXPENSES.filter((e) => e.groupId === groupId) : EXPENSES;
  const settlements = groupId
    ? SETTLEMENTS.filter((s) => s.groupId === groupId)
    : SETTLEMENTS;

  const net = new Map<string, number>();
  const add = (userId: string, delta: number) =>
    net.set(userId, (net.get(userId) ?? 0) + delta);

  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (split.userId === expense.paidBy) continue;
      if (expense.paidBy === forUserId) {
        add(split.userId, split.amountCents);
      } else if (split.userId === forUserId) {
        add(expense.paidBy, -split.amountCents);
      }
    }
  }

  for (const settlement of settlements) {
    if (settlement.paidBy === forUserId) {
      // I paid the counterpart: reduces what I owe them (or increases what they owe me).
      add(settlement.paidTo, settlement.amountCents);
    } else if (settlement.paidTo === forUserId) {
      // The counterpart paid me: reduces what they owe me (or increases what I owe them).
      add(settlement.paidBy, -settlement.amountCents);
    }
  }

  return Array.from(net.entries())
    .filter(([, netCents]) => netCents !== 0)
    .map(([counterpartId, netCents]) => ({
      counterpart: personById(counterpartId),
      netCents,
    }));
}

export type ActivityItem =
  | { kind: "expense"; id: string; date: string; expense: Expense }
  | { kind: "settlement"; id: string; date: string; settlement: Settlement };

export function getSharedGroups(userId: string): Group[] {
  return GROUPS.filter(
    (g) => g.memberIds.includes(userId) && g.memberIds.includes(CURRENT_USER_ID)
  );
}

export function getGroupActivity(groupId: string): ActivityItem[] {
  const expenses: ActivityItem[] = getGroupExpenses(groupId).map((expense) => ({
    kind: "expense",
    id: expense.id,
    date: expense.date,
    expense,
  }));
  const settlements: ActivityItem[] = getGroupSettlements(groupId).map((settlement) => ({
    kind: "settlement",
    id: settlement.id,
    date: settlement.date,
    settlement,
  }));
  return [...expenses, ...settlements].sort((a, b) => b.date.localeCompare(a.date));
}
