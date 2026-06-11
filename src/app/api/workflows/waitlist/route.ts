import { Resend } from "resend";
import { serve } from "@upstash/workflow/nextjs";
import { WaitlistWorkflowPayload } from "@/types/waitlist";

import { config } from "@/lib/config";
import { requiredEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/utils";
import { runIdempotentSideEffect } from "@/lib/idempotency";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const { POST } = serve<WaitlistWorkflowPayload>(
  async (context) => {
    const { type, eventId, email, data } = context.requestPayload;

    if (!EMAIL_REGEX.test(email)) {
      console.error(`Waitlist workflow rejected: invalid email format`);
      return;
    }

    const resend = new Resend(requiredEnv("RESEND_API_KEY"));

    const variables: Record<string, string | number> = {
      app_name: config.app.name,
    };

    /* 
      MANDATORY: At least one step must run for the workflow to be valid.
      This logs the event and prevents "Failed to authenticate Workflow request" errors when no other conditions are met.
    */
    await context.run("log-start", async () => {
      console.log("Waitlist workflow started", { eventId, type });
    });

    if (type === "waitlistEntry.created") {
      await context.run("send-confirmation-email", async () => {
        const result = await runIdempotentSideEffect(
          `idempotency:email:waitlist:confirmation:${data.id}`,
          async () => {
            console.log("Processing waitlist confirmation", {
              eventId,
              waitlistEntryId: data.id,
            });

            const { error } = await resend.emails.send({
              from: config.email.from.chief,
              to: [email],
              template: {
                id: requiredEnv("RESEND_CONFIRMATION_TEMPLATE_ID"),
                variables,
              },
            });

            if (error) {
              throw new Error(
                `Failed to send confirmation email: ${error.message}`,
              );
            }

            return { sent: true };
          },
        );

        if (!result) {
          console.log("Skipping duplicate waitlist confirmation email send");
        }

        return result ?? { skipped: true };
      });
    }

    if (type === "waitlistEntry.updated") {
      if (data.status === "invited") {
        await context.run("send-invitation-email", async () => {
          const result = await runIdempotentSideEffect(
            `idempotency:email:waitlist:invitation:${
              data.invitation?.id ?? eventId
            }`,
            async () => {
              console.log("Processing waitlist invitation", {
                eventId,
                invitationId: data.invitation?.id,
              });

              const invitationUrl = data.invitation?.url;
              const expiresAtTimestamp = data.invitation?.expires_at;

              if (!invitationUrl) {
                throw new Error("Invitation URL missing from webhook data");
              }

              const formattedExpiresAt = expiresAtTimestamp
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    timeZone: "UTC",
                    timeZoneName: "short",
                  }).format(new Date(expiresAtTimestamp))
                : undefined;

              const inviteUrl = `${invitationUrl}&redirect_url=${encodeURIComponent(
                absoluteUrl(config.routes.invitationAccept),
              )}`;

              const { error } = await resend.emails.send({
                from: config.email.from.chief,
                to: [email],
                template: {
                  id: requiredEnv("RESEND_INVITATION_TEMPLATE_ID"),
                  variables: {
                    ...variables,
                    inviteUrl,
                    ...(formattedExpiresAt
                      ? { expiresAt: formattedExpiresAt }
                      : {}),
                  },
                },
              });

              if (error) {
                throw new Error(
                  `Failed to send invitation email: ${error.message}`,
                );
              }

              return { sent: true };
            },
          );

          if (!result) {
            console.log("Skipping duplicate waitlist invitation email send");
          }

          return result ?? { skipped: true };
        });
      }
    }
  },
  {
    baseUrl: config.app.url,
    failureFunction: async ({ context, failStatus, failResponse }) => {
      console.error(
        `Waitlist workflow failed [status=${failStatus}]: ${failResponse}`,
        { workflowRunId: context.workflowRunId },
      );
    },
  },
);
