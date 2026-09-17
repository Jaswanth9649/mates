import { isGroupAdmin, isGroupMember } from "@/lib/db/queries/groups";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Throws ForbiddenError unless the given user belongs to the group.
 * Call this at the top of every group-scoped page/layout AND API route —
 * layouts don't protect app/api/** routes, so each needs its own check.
 */
export async function assertGroupMember(groupId: string, userId: string) {
  const member = await isGroupMember(groupId, userId);
  if (!member) throw new ForbiddenError("Not a member of this group");
}

export async function assertGroupAdmin(groupId: string, userId: string) {
  const admin = await isGroupAdmin(groupId, userId);
  if (!admin) throw new ForbiddenError("Not an admin of this group");
}
