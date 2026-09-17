"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/format";

export type MemberRow = {
  id: string;
  role: "admin" | "member";
  isYou: boolean;
  isPending: boolean;
  name: string;
  email: string | null;
};

export function MembersManager({
  groupId,
  members,
  canManage,
}: {
  groupId: string;
  members: MemberRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [inviting, setInviting] = React.useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to invite");
      toast.success(`Invited ${email}`);
      setEmail("");
      router.refresh();
    } catch {
      toast.error("Couldn't send that invite — try again");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that member — try again");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleInvite} className="flex gap-2">
        <Input
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={inviting || !email.trim()}>
          <Plus className="size-4" />
          {inviting ? "Inviting…" : "Invite"}
        </Button>
      </form>

      <Card>
        <CardContent className="divide-y divide-border py-0">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                {member.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                )}
              </div>
              {member.isPending && <Badge variant="outline">Invited</Badge>}
              {member.role === "admin" && <Badge variant="secondary">Admin</Badge>}
              {member.isYou && <Badge variant="secondary">You</Badge>}
              {canManage && !member.isYou && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(member.id)}
                  aria-label={`Remove ${member.name}`}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
