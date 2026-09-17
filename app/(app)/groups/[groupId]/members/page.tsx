import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/format";
import { CURRENT_USER_ID, getGroup, getGroupMembers } from "@/lib/mock-data";

export default async function GroupMembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) notFound();

  const members = getGroupMembers(groupId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
        <Button size="sm" disabled>
          <Plus className="size-4" />
          Invite
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-border py-0">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              {member.id === CURRENT_USER_ID && (
                <Badge variant="secondary">You</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Inviting and removing members will be wired up once accounts (Clerk) are
        connected.
      </p>
    </div>
  );
}
