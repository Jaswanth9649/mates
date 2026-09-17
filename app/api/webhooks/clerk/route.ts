import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("CLERK_WEBHOOK_SECRET is not set", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  // svix's verify() only validates the signature (throws if invalid) and
  // does not return the parsed payload — parse the raw body ourselves once
  // verification succeeds.
  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body) as WebhookEvent;

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const primaryEmail = email_addresses.find(
      (e) => e.id === event.data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      return new Response("User has no primary email", { status: 400 });
    }

    const displayName =
      [first_name, last_name].filter(Boolean).join(" ") || primaryEmail;

    const db = getDb();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          email: primaryEmail,
          displayName,
          avatarUrl: image_url ?? null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, id));
    } else {
      await db.insert(users).values({
        clerkUserId: id,
        email: primaryEmail,
        displayName,
        avatarUrl: image_url ?? null,
      });
    }
  }

  return new Response("OK", { status: 200 });
}
