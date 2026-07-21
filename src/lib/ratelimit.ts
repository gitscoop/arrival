import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const waitlistRatelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "waitlist:ratelimit",
  ephemeralCache: false,
  analytics: true,
});

export const globalRatelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "global:ratelimit",
  ephemeralCache: false,
  analytics: true,
});
