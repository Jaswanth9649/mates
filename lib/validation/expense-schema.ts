import { z } from "zod";

export const createExpenseSchema = z.object({
  description: z.string().trim().min(1).max(200),
  amountCents: z.number().int().positive(),
  currency: z.string().trim().length(3).default("USD"),
  category: z.string().trim().max(60).optional(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  paidBy: z.string().uuid(),
  splitType: z.enum(["equal", "exact", "percentage"]),
  splits: z
    .array(
      z.object({
        userId: z.string().uuid(),
        amountCents: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema;
