import { z } from "zod";

import { CURRENCY_CODES } from "@/lib/currencies";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  currency: z.enum(CURRENCY_CODES).default("USD"),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  currency: z.enum(CURRENCY_CODES).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email(),
});
