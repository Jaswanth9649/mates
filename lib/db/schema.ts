import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  unique,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  currency: text("currency").notNull().default("USD"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    // Nullable: a member invited by email who hasn't signed up yet. Resolved
    // to a real user_id via the Clerk webhook matching invitedEmail on
    // user.created.
    userId: uuid("user_id").references(() => users.id),
    invitedEmail: text("invited_email"),
    role: memberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.groupId, table.userId)]
);

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

export const splitTypeEnum = pgEnum("split_type", [
  "equal",
  "exact",
  "percentage",
  "line_item",
]);

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category"),
  expenseDate: date("expense_date").notNull(),
  splitType: splitTypeEnum("split_type").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  owedAmountCents: integer("owed_amount_cents").notNull(),
});

export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id),
  paidTo: uuid("paid_to")
    .notNull()
    .references(() => users.id),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  note: text("note"),
  settledAt: timestamp("settled_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;

export const recurringFrequencyEnum = pgEnum("recurring_frequency", [
  "weekly",
  "monthly",
]);

export const recurringExpenses = pgTable("recurring_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category"),
  splitType: splitTypeEnum("split_type").notNull(),
  frequency: recurringFrequencyEnum("frequency").notNull(),
  // The next calendar date this schedule is due to materialize into a real
  // expense. Advanced by lib/recurring/next-run.ts each time the cron route
  // processes it; starts equal to the schedule's start date.
  nextRunDate: date("next_run_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;

export const recurringExpenseSplits = pgTable("recurring_expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  recurringExpenseId: uuid("recurring_expense_id")
    .notNull()
    .references(() => recurringExpenses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  owedAmountCents: integer("owed_amount_cents").notNull(),
});

export type RecurringExpenseSplit = typeof recurringExpenseSplits.$inferSelect;
export type NewRecurringExpenseSplit = typeof recurringExpenseSplits.$inferInsert;

export const expenseComments = pgTable("expense_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ExpenseComment = typeof expenseComments.$inferSelect;
export type NewExpenseComment = typeof expenseComments.$inferInsert;
