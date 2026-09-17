import { notFound } from "next/navigation";

import { MembersManager, type MemberRow } from "@/components/groups/members-manager";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getGroupById,
  getGroupMembers,
  isGroupAdmin,
  isGroupMember,
} from "@/lib/db/queries/groups";

export default async function GroupMembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const group = await getGroupById(groupId);
  if (!group) notFound();

  const isMember = await isGroupMember(groupId, user.id);
  if (!isMember) notFound();

  const [members, canManage] = await Promise.all([
    getGroupMembers(groupId),
    isGroupAdmin(groupId, user.id),
  ]);

  const rows: MemberRow[] = members.map((m) => ({
    id: m.id,
    role: m.role,
    isYou: m.user?.id === user.id,
    isPending: !m.user,
    name: m.user?.displayName ?? m.invitedEmail ?? "Pending invite",
    email: m.user?.email ?? m.invitedEmail,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">{group.name}</p>
      </div>

      <MembersManager groupId={groupId} members={rows} canManage={canManage} />
    </div>
  );
}
