import { Redis } from "@upstash/redis";
import * as readline from "node:readline";

export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  key: (msg: string) =>
    console.log(
      `  ${colors.dim}→${colors.reset} ${colors.cyan}${msg}${colors.reset}`,
    ),
};

export function getRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url) {
    log.error("Missing UPSTASH_REDIS_REST_URL environment variable");
    process.exit(1);
  }

  if (!token) {
    log.error("Missing UPSTASH_REDIS_REST_TOKEN environment variable");
    process.exit(1);
  }

  return new Redis({ url, token });
}

export interface ParsedArgs {
  all: boolean;
  fingerprint?: string;
  ip?: string;
  email?: string;
  scope?: string;
  type?: string;
  dryRun: boolean;
  yes: boolean;
  help: boolean;
}

export function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    all: false,
    fingerprint: undefined,
    ip: undefined,
    email: undefined,
    scope: undefined,
    type: undefined,
    dryRun: false,
    yes: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--all":
      case "-a":
        parsed.all = true;
        break;
      case "--fingerprint":
      case "-f":
        parsed.fingerprint = args[++i];
        break;
      case "--ip":
      case "-i":
        parsed.ip = args[++i];
        break;
      case "--email":
      case "-e":
        parsed.email = args[++i];
        break;
      case "--scope":
      case "-s":
        parsed.scope = args[++i];
        break;
      case "--type":
      case "-t":
        parsed.type = args[++i];
        break;
      case "--dry-run":
      case "-d":
        parsed.dryRun = true;
        break;
      case "--yes":
      case "-y":
        parsed.yes = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
    }
  }

  return parsed;
}

// prompts for y/N confirmation
export async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}?${colors.reset} ${message} ${colors.dim}(y/N)${colors.reset} `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
      },
    );
  });
}

export async function getKeysByPattern(
  redis: Redis,
  pattern: string,
): Promise<string[]> {
  const keys: string[] = [];
  let cursor = 0;

  /*
    Finds matching keys in small batches instead of loading them all at once
  */
  do {
    const result = await redis.scan(cursor, {
      match: pattern,
      count: 100,
    });

    cursor = Number(result[0]);
    keys.push(...result[1]);
  } while (cursor !== 0);

  return keys;
}

export async function deleteKeys(
  redis: Redis,
  keys: string[],
  options: { dryRun: boolean } = { dryRun: false },
): Promise<number> {
  if (keys.length === 0) {
    return 0;
  }

  if (options.dryRun) {
    return 0;
  }

  /*
    Batches deletes to avoid hitting Upstash request-size limits on large key sets
  */
  const batchSize = 100;

  let deleted = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const result = await redis.del(...batch);

    deleted += result;
  }

  return deleted;
}

export async function deleteKeysByPattern(
  redis: Redis,
  pattern: string,
  options: { dryRun: boolean } = { dryRun: false },
): Promise<{ keys: string[]; deleted: number }> {
  const keys = await getKeysByPattern(redis, pattern);
  const deleted = await deleteKeys(redis, keys, options);
  return { keys, deleted };
}

export async function deleteKey(
  redis: Redis,
  key: string,
  options: { dryRun: boolean } = { dryRun: false },
): Promise<boolean> {
  if (options.dryRun) {
    return true;
  }

  const result = await redis.del(key);
  return result === 1;
}

export async function flushDatabase(
  redis: Redis,
  options: { dryRun: boolean } = { dryRun: false },
): Promise<void> {
  if (options.dryRun) {
    return;
  }

  await redis.flushdb();
}

/* 
  Canonical list of key prefixes managed by this project.
  Used by `flush-all.ts` for key breakdown and by `showInfo()` for rate-limit counts.
  Add a new entry here whenever a new key namespace is introduced.
*/
export const KEY_PREFIXES: {
  prefix: string;
  label: string;
  description: string;
}[] = [
  {
    prefix: "waitlist:ratelimit:*",
    label: "Waitlist rate limits",
    description: "Sliding window rate limits per composite fingerprint:ip",
  },
  {
    prefix: "global:ratelimit:*",
    label: "Global rate limits",
    description: "IP-level backstop rate limits shared across all features",
  },
  {
    prefix: "waitlist:emails:*",
    label: "Email cache buckets",
    description: "4 fixed bucket keys (allowed / typo / invalid / blocked)",
  },
];

/*
  Email validation cache bucket definitions — shared between `clear-emails.ts`
  and `showInfo()` in `index.ts`. Using scard/hlen per-bucket gives actual
  entry counts rather than just counting Redis key objects.
*/
export const EMAIL_CACHE_BUCKETS = {
  allowed: {
    key: "waitlist:emails:allowed",
    dataType: "set" as const,
    label: "Allowed emails",
    description: "Emails that passed validation",
  },
  typo: {
    key: "waitlist:emails:typo",
    dataType: "hash" as const,
    label: "Typo suggestions",
    description: "Emails mapped to their suggested correction",
  },
  invalid: {
    key: "waitlist:emails:invalid",
    dataType: "set" as const,
    label: "Invalid emails",
    description: "Emails that failed validation as invalid",
  },
  blocked: {
    key: "waitlist:emails:blocked",
    dataType: "set" as const,
    label: "Blocked emails",
    description: "Emails blocked as undeliverable",
  },
} as const;

export type EmailCacheType = keyof typeof EMAIL_CACHE_BUCKETS;

export const EMAIL_CACHE_TYPES = Object.keys(
  EMAIL_CACHE_BUCKETS,
) as EmailCacheType[];

export async function getEmailBucketSize(
  redis: Redis,
  type: EmailCacheType,
): Promise<number> {
  const { key, dataType } = EMAIL_CACHE_BUCKETS[type];

  /*
    Typo bucket is a hash, the rest are sets.
  */
  if (dataType === "hash") {
    return await redis.hlen(key);
  }

  return await redis.scard(key);
}

export async function getKeyCount(redis: Redis): Promise<number> {
  return await redis.dbsize();
}

// formats numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

export function printHelp(
  command: string,
  description: string,
  options: { flag: string; description: string }[],
): void {
  console.log(`
  ${colors.bright}${command}${colors.reset}
  ${description}

  ${colors.bright}Options:${colors.reset}
  ${options.map((opt) => `${colors.cyan}${opt.flag.padEnd(25)}${colors.reset}${opt.description}`).join("\n  ")}
  `);
}
