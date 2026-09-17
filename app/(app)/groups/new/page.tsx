"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currencies";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [currency, setCurrency] = React.useState<CurrencyCode>("USD");
  const [emailInput, setEmailInput] = React.useState("");
  const [invitees, setInvitees] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const addInvitee = () => {
    const email = emailInput.trim();
    if (email && !invitees.includes(email)) {
      setInvitees([...invitees, email]);
    }
    setEmailInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      const { group } = await res.json();

      for (const email of invitees) {
        await fetch(`/api/groups/${group.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => null);
      }

      toast.success(`"${group.name}" created`);
      router.push(`/groups/${group.id}`);
      router.refresh();
    } catch {
      toast.error("Couldn't create the group — try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New group</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Group details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input
                id="group-name"
                placeholder="e.g. Iceland Trip 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency((value as CurrencyCode) ?? "USD")}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(value: CurrencyCode) => {
                      const c = SUPPORTED_CURRENCIES.find((c) => c.code === value);
                      return c ? `${c.symbol} ${c.code} — ${c.label}` : value;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-email">Invite members by email</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInvitee();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addInvitee}>
                  Add
                </Button>
              </div>
              {invitees.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {invitees.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1 pr-1">
                      {email}
                      <button
                        type="button"
                        onClick={() =>
                          setInvitees(invitees.filter((e) => e !== email))
                        }
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                        aria-label={`Remove ${email}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Invited people who haven&apos;t signed up yet will join automatically
                once they create an account with this email.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/groups")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || submitting}>
                {submitting ? "Creating…" : "Create group"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
