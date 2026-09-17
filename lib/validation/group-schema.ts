import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  currency: z.string().trim().length(3).default("USD"),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email(),
});
