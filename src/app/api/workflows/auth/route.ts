import { Resend } from "resend";
import { serve } from "@upstash/workflow/nextjs";
import { AuthWorkflowPayload } from "@/types/auth";

import { config } from "@/lib/config";
import { requiredEnv } from "@/lib/env";
import { runIdempotentSideEffect } from "@/lib/idempotency";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const { POST } = serve<AuthWorkflowPayload>(
  async (context) => {
    const { type, eventId, email, data } = context.requestPayload;

    if (!EMAIL_REGEX.test(email)) {
      console.error(`Auth workflow rejected: invalid email format`);
      return;
    }

    const resend = new Resend(requiredEnv("RESEND_API_KEY"));

    /* 
      MANDATORY: At least one step must run for the workflow to be valid.
      This logs the event and prevents "Failed to authenticate Workflow request" errors when no other conditions are met.
    */
    await context.run("log-start", async () => {
      console.log("Auth workflow started", { eventId, type });
    });

    // handles email creation events
    if (type === "email.created") {
      const slug = data.slug;

      if (
        [
          "verification_code",
          "reset_password_code",
          "password_changed",
        ].includes(slug)
      ) {
        await context.run(`send-auth-email-${slug}`, async () => {
          const result = await runIdempotentSideEffect(
            `idempotency:email:auth:${slug}:${data.id || eventId}`,
            async () => {
              console.log("Sending auth email", { eventId, slug });

              const requestedAtFallback = new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              let templateId: string | undefined;

              let variables: Record<string, string | number> = {
                app_name: config.app.name,
              };

              if (
                slug === "verification_code" ||
                slug === "reset_password_code"
              ) {
                const otpCode = data.data.otp_code;

                if (!otpCode) {
                  throw new Error("OTP code missing from webhook data");
                }

                templateId =
                  slug === "verification_code"
                    ? requiredEnv("RESEND_VERIFICATION_TEMPLATE_ID")
                    : requiredEnv("RESEND_PASSWORD_RESET_TEMPLATE_ID");

                variables = {
                  ...variables,
                  otp_code: otpCode,
                  requested_from:
                    data.data.requested_from ||
                    (slug === "verification_code"
                      ? `${config.app.name} Sign-in`
                      : `${config.app.name} Password Reset`),
                  requested_at: data.data.requested_at || requestedAtFallback,
                };
              } else if (slug === "password_changed") {
                templateId = requiredEnv("RESEND_PASSWORD_CHANGED_TEMPLATE_ID");

                variables = {
                  ...variables,
                  primary_email_address:
                    data.data.primary_email_address || email,
                };
              }

              if (!templateId) {
                throw new Error(`Template ID missing for slug: ${slug}`);
              }

              const { error } = await resend.emails.send({
                from: config.email.from.auth,
                to: [email],
                template: {
                  id: templateId,
                  variables,
                },
              });

              if (error) {
                throw new Error(
                  `Failed to send ${slug} email: ${error.message}`,
                );
              }

              return { sent: true, slug };
            },
          );

          if (!result) {
            console.log(`Skipping duplicate auth email send [${slug}]`);
          }

          return result ?? { skipped: true, slug };
        });
      }
    }
  },
  {
    baseUrl: config.app.url,
    failureFunction: async ({ context, failStatus, failResponse }) => {
      console.error(
        `Auth workflow failed [status=${failStatus}]: ${failResponse}`,
        { workflowRunId: context.workflowRunId },
      );
    },
  },
);
