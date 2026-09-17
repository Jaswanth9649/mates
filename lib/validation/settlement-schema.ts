import { z } from "zod";

export const createSettlementSchema = z.object({
  groupId: z.string().uuid(),
  paidBy: z.string().uuid(),
  paidTo: z.string().uuid(),
  amountCents: z.number().int().positive(),
  currency: z.string().trim().length(3),
  note: z.string().trim().max(200).optional(),
});
