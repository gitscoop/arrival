import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import { absoluteUrl } from "@/lib/utils";
import { workflowClient } from "@/lib/workflow";
import { claimIdempotencyKey, releaseIdempotencyKey } from "@/lib/idempotency";

import { AuthWorkflowPayload, ClerkEmailEventData } from "@/types/auth";
import { WaitlistEntryData, WaitlistWorkflowPayload } from "@/types/waitlist";

function resolveEventId(evt: WebhookEvent, svixId: string): string {
  const eventId = (evt as { id?: unknown }).id;
  return typeof eventId === "string" && eventId ? eventId : svixId;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Server configuration error", { status: 500 });
  }

  // reads svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Missing Svix headers", { status: 400 });
  }

  /* 
    Verifies against the raw body to preserve exact bytes for HMAC validation.
    Using req.json() + JSON.stringify() can alter whitespace/formatting and cause valid signatures to fail.
  */
  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const eventType = evt.type;
  const eventId = resolveEventId(evt, svix_id);

  // handles auth email events
  if (eventType === "email.created") {
    const data = evt.data as ClerkEmailEventData;
    const email = data.to_email_address;

    const allowedSlugs = [
      "verification_code",
      "reset_password_code",
      "password_changed",
    ];

    if (allowedSlugs.includes(data.slug)) {
      const idempotencyKey = `idempotency:webhook:clerk:${eventId}`;
      const claimed = await claimIdempotencyKey(idempotencyKey);

      if (!claimed) {
        return new Response("Email event already processed", { status: 200 });
      }

      try {
        const payload: AuthWorkflowPayload = {
          type: eventType,
          eventId,
          email: email,
          data: data,
        };

        await workflowClient.trigger({
          url: absoluteUrl("/api/workflows/auth"),
          body: payload,
          retries: 3,
        });

        console.log("Auth workflow triggered", {
          eventId,
          slug: data.slug,
        });
      } catch (err) {
        await releaseIdempotencyKey(idempotencyKey);
        console.error("Failed to trigger auth workflow:", err);
        return new Response("Workflow trigger failed", { status: 500 });
      }
    }

    return new Response("Email event received", { status: 200 });
  }

  /* 
    Extracts the minimal data needed and triggers the workflow
  */
  const data = evt.data as WaitlistEntryData;
  const email = data.email_address;

  if (
    eventType === "waitlistEntry.created" ||
    (eventType === "waitlistEntry.updated" && data.status === "invited")
  ) {
    const idempotencyKey = `idempotency:webhook:clerk:${eventId}`;
    const claimed = await claimIdempotencyKey(idempotencyKey);

    if (!claimed) {
      return new Response("Webhook already processed", { status: 200 });
    }

    try {
      const payload: WaitlistWorkflowPayload = {
        type: eventType,
        eventId,
        email: email,
        data: data,
      };

      await workflowClient.trigger({
        url: absoluteUrl("/api/workflows/waitlist"),
        body: payload,
        retries: 3,
      });

      console.log("Waitlist workflow triggered", {
        eventId,
        eventType,
      });
    } catch (err) {
      await releaseIdempotencyKey(idempotencyKey);
      console.error("Failed to trigger workflow:", err);
      return new Response("Workflow trigger failed", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
