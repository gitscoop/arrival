import "server-only";

import { redis } from "@/lib/redis";

/*
  Sets how long successful idempotency claims stay in redis before duplicates are allowed again
*/
const DEFAULT_IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 7;

/*
  NX makes the claim atomic: only the first caller can create the key.
*/
export async function claimIdempotencyKey(
  key: string,
  ttlSeconds = DEFAULT_IDEMPOTENCY_TTL_SECONDS,
): Promise<boolean> {
  const result = await redis.set(key, "1", {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
}

/*
  Deletes the claim on failure so the side effect can be retried
*/
export async function releaseIdempotencyKey(key: string): Promise<void> {
  await redis.del(key);
}

export async function runIdempotentSideEffect<T>(
  key: string,
  sideEffect: () => Promise<T>,
): Promise<T | null> {
  const claimed = await claimIdempotencyKey(key);

  /*
    A missing claim means this side effect already ran or is in progress
  */
  if (!claimed) return null;

  try {
    return await sideEffect();
  } catch (err) {
    await releaseIdempotencyKey(key);
    throw err;
  }
}
