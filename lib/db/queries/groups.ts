import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { groupMembers, groups, users } from "@/lib/db/schema";

export async function createGroup(opts: {
  name: string;
  currency: string;
  createdByUserId: string;
}) {
  const db = getDb();
  const [group] = await db
    .insert(groups)
    .values({
      name: opts.name,
      currency: opts.currency,
      createdBy: opts.createdByUserId,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: opts.createdByUserId,
    role: "admin",
  });

  return group;
}

export async function getGroupsForUser(userId: string) {
  const db = getDb();
  return db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, userId), eq(groups.isArchived, false)))
    .then((rows) => rows.map((r) => r.group));
}

export async function getGroupById(groupId: string) {
  const db = getDb();
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return group ?? null;
}

export async function getGroupMembers(groupId: string) {
  const db = getDb();
  return db
    .select({
      id: groupMembers.id,
      role: groupMembers.role,
      invitedEmail: groupMembers.invitedEmail,
      joinedAt: groupMembers.joinedAt,
      user: users,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
}

export async function isGroupMember(groupId: string, userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);
  return !!row;
}

export async function isGroupAdmin(groupId: string, userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.role, "admin")
      )
    )
    .limit(1);
  return !!row;
}

export async function inviteMemberByEmail(groupId: string, email: string) {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const [member] = await db
    .insert(groupMembers)
    .values({
      groupId,
      userId: existingUser?.id ?? null,
      invitedEmail: existingUser ? null : normalizedEmail,
      role: "member",
    })
    .returning();

  return member;
}

export async function removeMember(groupId: string, memberRowId: string) {
  const db = getDb();
  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.id, memberRowId), eq(groupMembers.groupId, groupId)));
}

/**
 * Links any pending email-only invites to a newly created/updated user.
 * Called from the Clerk webhook so an invited user is recognized as soon as
 * they sign up, even though they weren't a real user_id at invite time.
 */
export async function resolvePendingInvites(userId: string, email: string) {
  const db = getDb();
  await db
    .update(groupMembers)
    .set({ userId, invitedEmail: null })
    .where(eq(groupMembers.invitedEmail, email.trim().toLowerCase()));
}
