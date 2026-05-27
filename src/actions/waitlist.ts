"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import { checkBotId } from "botid/server";
import { clerkClient } from "@clerk/nextjs/server";

import ZeroBounceSDK, {
  type ZeroBounceValidationResult,
  type ZeroBounceApiError,
} from "@zerobounce/zero-bounce-sdk";

import { redis } from "@/lib/redis";
import { requiredEnv } from "@/lib/env";
import { waitlistSchema } from "@/lib/schema";
import { ZbStatus, ZbSubStatus } from "@/lib/zerobounce";
import { waitlistRatelimiter, globalRatelimiter } from "@/lib/ratelimit";

interface WaitlistState {
  success: boolean;
  message: string;
  reason?: "RATE_LIMIT" | "UNDELIVERABLE" | "SERVICE_ERROR";
}

function resendAudienceSyncError(): WaitlistState {
  return {
    success: false,
    message:
      "Waitlist signup is temporarily unavailable. Please try again later.",
    reason: "SERVICE_ERROR",
  };
}

function isMissingResendContactError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    err.statusCode === 404
  );
}

async function ensureClerkWaitlist(
  email: string,
): Promise<{ success: boolean; message?: string; isNewEntry?: boolean }> {
  try {
    const client = await clerkClient();

    const existingEntries = await client.waitlistEntries.list({
      query: email,
    });

    const alreadyExists = existingEntries.data.some(
      (entry) => entry.emailAddress.toLowerCase() === email.toLowerCase(),
    );

    if (alreadyExists) {
      return { success: true, isNewEntry: false };
    }

    await client.waitlistEntries.create({
      emailAddress: email,
    });

    return { success: true, isNewEntry: true };
  } catch (err) {
    console.error("Clerk operation failed:", err);

    return {
      success: false,
      message: "Oops, something went wrong. Please try again!",
    };
  }
}

export async function joinWaitlist(
  _prevState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  /* 
    1. Vercel BotID Protection
  */
  const botCheck = await checkBotId({
    advancedOptions: { checkLevel: "basic" },
    developmentOptions: { bypass: "HUMAN" },
  });

  if (botCheck.isBot) {
    return { success: false, message: "Request blocked by security policy." };
  }

  /* 
    2. Environment Variables Check
  */
  let resendApiKey: string;
  let resendSegmentId: string;
  let zeroBounceApiKey: string;

  try {
    requiredEnv("CLERK_SECRET_KEY");
    requiredEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
    resendApiKey = requiredEnv("RESEND_API_KEY");
    resendSegmentId = requiredEnv("RESEND_SEGMENT_ID");
    zeroBounceApiKey = requiredEnv("ZEROBOUNCE_API_KEY");
  } catch (err) {
    console.error(err);

    return {
      success: false,
      message: "Internal server error. Please try again later.",
    };
  }

  /* 
    3. Form Data Extraction
  */
  const rawEmail = formData.get("email");
  const rawFingerprint = formData.get("fingerprintId");

  /* 
    4. Input Parse
  */
  const validatedFields = waitlistSchema.safeParse({ email: rawEmail });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues[0].message,
    };
  }

  const email = validatedFields.data.email.toLowerCase();

  /* 
    5. Input Validation
  */
  const isValidFingerprint =
    typeof rawFingerprint === "string" &&
    /^[a-zA-Z0-9_-]{10,64}$/.test(rawFingerprint);

  const safeFingerprint = isValidFingerprint ? rawFingerprint : null;

  /* 
    6. Centralized Identity
  */
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";

  const identifier = safeFingerprint ? `${safeFingerprint}:${ip}` : ip;

  /* 
    7. Rate Limiting
  */
  const [{ success: idAllowed }, { success: ipAllowed }] = await Promise.all([
    waitlistRatelimiter.limit(identifier),
    globalRatelimiter.limit(ip),
  ]);

  if (!idAllowed || !ipAllowed) {
    return {
      success: false,
      message: "Too many attempts. Please try again later.",
      reason: "RATE_LIMIT",
    };
  }

  /* 
    8. Resend - Check if contact already exists in audience
  */
  const resend = new Resend(resendApiKey);

  try {
    const { data: existingContact, error: getError } =
      await resend.contacts.get({
        email: email,
        audienceId: resendSegmentId,
      });

    if (getError && !isMissingResendContactError(getError)) {
      console.error("Resend get contact error:", getError);
      return resendAudienceSyncError();
    }

    if (existingContact) {
      const clerkResult = await ensureClerkWaitlist(email);

      if (!clerkResult.success) {
        return {
          success: false,
          message:
            clerkResult.message ||
            "Oops, something went wrong. Please try again!",
        };
      }

      let resubscribed = false;

      if (existingContact.unsubscribed) {
        const { error: updateError } = await resend.contacts.update({
          id: existingContact.id,
          audienceId: resendSegmentId,
          unsubscribed: false,
        });

        if (updateError) {
          console.error("Resend update contact error:", updateError);
          return resendAudienceSyncError();
        }

        resubscribed = true;
      }

      if (clerkResult.isNewEntry) {
        return {
          success: true,
          message: "You're in! Look out for an email.",
        };
      }

      if (resubscribed) {
        return {
          success: true,
          message: "Good to have you back!",
        };
      }

      return {
        success: true,
        message: "You're already in!",
      };
    }
  } catch (err) {
    if (!isMissingResendContactError(err)) {
      console.error("Resend get contact error:", err);
      return resendAudienceSyncError();
    }
  }

  /* 
    9. Upstash Redis - Check if email was previously submitted
  */
  const [isAllowed, typoSuggestion, isInvalid, isBlocked] = await Promise.all([
    redis.sismember(`waitlist:emails:allowed`, email),
    redis.hget(`waitlist:emails:typo`, email),
    redis.sismember(`waitlist:emails:invalid`, email),
    redis.sismember(`waitlist:emails:blocked`, email),
  ]);

  const validationResult = {
    isAllowed: !!isAllowed,
    isTypo: !!typoSuggestion,
    isInvalid: !!isInvalid,
    isBlocked: !!isBlocked,
    typoSuggestion: typoSuggestion as string | null,
  };

  const isCacheMiss = !isAllowed && !typoSuggestion && !isInvalid && !isBlocked;

  /* 
    10. ZeroBounce Validation
  */
  if (isCacheMiss) {
    let validation: ZeroBounceValidationResult | ZeroBounceApiError | undefined;

    try {
      const zeroBounce = new ZeroBounceSDK();
      zeroBounce.init(zeroBounceApiKey);
      validation = await zeroBounce.validateEmail(email);
    } catch (err) {
      console.error("ZeroBounce validation error:", err);
    }

    if (validation && "error" in validation) {
      console.error("ZeroBounce API error:", validation.error);

      return {
        success: false,
        message:
          "Email verification is temporarily unavailable. Please try again later.",
        reason: "SERVICE_ERROR",
      };
    }

    if (!validation) {
      return {
        success: false,
        message: "Oops, something went wrong. Please try again!",
        reason: "SERVICE_ERROR",
      };
    }

    const status = validation.status as ZbStatus;
    const subStatus = validation.sub_status as ZbSubStatus;

    validationResult.isAllowed =
      status === ZbStatus.Valid ||
      (status === ZbStatus.DoNotMail && subStatus === ZbSubStatus.RoleBased);

    validationResult.isTypo =
      !validationResult.isAllowed &&
      status === ZbStatus.Invalid &&
      subStatus === ZbSubStatus.PossibleTypo &&
      !!validation.did_you_mean;

    if (validationResult.isTypo) {
      validationResult.typoSuggestion = validation.did_you_mean;
    }

    validationResult.isInvalid =
      !validationResult.isAllowed &&
      !validationResult.isTypo &&
      status === ZbStatus.Invalid &&
      subStatus !== ZbSubStatus.PossibleTypo;

    validationResult.isBlocked =
      !validationResult.isAllowed &&
      !validationResult.isTypo &&
      !validationResult.isInvalid;

    /* 
      11. Upstash Redis - Cache validation outcome by category
    */
    if (validationResult.isAllowed) {
      await redis.sadd(`waitlist:emails:allowed`, email);
    } else if (validationResult.isTypo && validationResult.typoSuggestion) {
      await redis.hset(`waitlist:emails:typo`, {
        [email]: validationResult.typoSuggestion,
      });
    } else if (validationResult.isInvalid) {
      await redis.sadd(`waitlist:emails:invalid`, email);
    } else {
      await redis.sadd(`waitlist:emails:blocked`, email);
    }
  }

  /* 
    12. Validation Result Gating
  */
  if (validationResult.isTypo && validationResult.typoSuggestion) {
    return {
      success: false,
      message: `Did you mean ${validationResult.typoSuggestion}?`,
    };
  }

  if (validationResult.isInvalid) {
    return {
      success: false,
      message: "Please try a different email address.",
    };
  }

  if (validationResult.isBlocked) {
    return {
      success: false,
      message: "Thanks for dropping by!",
      reason: "UNDELIVERABLE",
    };
  }

  /* 
    13. Clerk - Add to waitlist
  */
  const clerkResult = await ensureClerkWaitlist(email);

  if (!clerkResult.success) {
    return {
      success: false,
      message:
        clerkResult.message || "Oops, something went wrong. Please try again!",
    };
  }

  /* 
    14. Resend - Create contact and add to audience
  */
  try {
    const { error: createError } = await resend.contacts.create({
      email: email,
      unsubscribed: false,
      audienceId: resendSegmentId,
    });

    if (createError) {
      console.error("Resend create contact error:", createError);
      return resendAudienceSyncError();
    }
  } catch (err) {
    console.error("Resend error:", err);
    return resendAudienceSyncError();
  }

  if (clerkResult.isNewEntry) {
    return {
      success: true,
      message: "You're in! Look out for an email.",
    };
  }

  return {
    success: true,
    message: "You're already in!",
  };
}
