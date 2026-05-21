/*
  Clears email validation cache keys from Redis

  The waitlist action caches email validation results in four fixed global
  keys to avoid redundant external API calls:

    waitlist:emails:allowed  (Set)   — emails that passed validation
    waitlist:emails:typo     (Hash)  — email → suggested correction
    waitlist:emails:invalid  (Set)   — emails that failed as invalid
    waitlist:emails:blocked  (Set)   — emails that were blocked/undeliverable

  Usage:
    pnpm redis clear:emails --all                    # Clear all four cache keys
    pnpm redis clear:emails --type allowed           # Clear only 'allowed' set
    pnpm redis clear:emails --type typo              # Clear only 'typo' hash
    pnpm redis clear:emails --type invalid           # Clear only 'invalid' set
    pnpm redis clear:emails --type blocked           # Clear only 'blocked' set
    pnpm redis clear:emails --all --dry-run          # Preview without deleting
*/

import {
  getRedisClient,
  parseArgs,
  confirm,
  deleteKey,
  EMAIL_CACHE_BUCKETS,
  type EmailCacheType,
  EMAIL_CACHE_TYPES,
  getEmailBucketSize,
  log,
  colors,
  formatNumber,
  pluralize,
  printHelp,
} from "./utils";

async function getKeyMembers(
  redis: ReturnType<typeof getRedisClient>,
  type: EmailCacheType,
  limit = 5,
): Promise<string[]> {
  const { key, dataType } = EMAIL_CACHE_BUCKETS[type];

  if (dataType === "hash") {
    const hashKeys = await redis.hkeys(key);
    return hashKeys.slice(0, limit);
  }

  const members = await redis.smembers(key);
  return (members as string[]).slice(0, limit);
}

async function printCacheKeyInfo(
  redis: ReturnType<typeof getRedisClient>,
  type: EmailCacheType,
): Promise<number> {
  const { label, description } = EMAIL_CACHE_BUCKETS[type];
  const count = await getEmailBucketSize(redis, type);
  const countStr = formatNumber(count).padStart(8);

  console.log(
    `  ${colors.cyan}${label.padEnd(22)}${colors.reset}${countStr}  ${colors.dim}${description}${colors.reset}`,
  );

  return count;
}

async function clearSingleKey(
  redis: ReturnType<typeof getRedisClient>,
  type: EmailCacheType,
  opts: { dryRun: boolean; yes: boolean },
): Promise<void> {
  const { key, label } = EMAIL_CACHE_BUCKETS[type];
  log.info(`Checking ${label.toLowerCase()} cache...`);
  const exists = await redis.exists(key);

  if (!exists) {
    log.info(`No ${label.toLowerCase()} cache found`);
    return;
  }

  const count = await getEmailBucketSize(redis, type);

  log.info(
    `Found ${colors.bright}${formatNumber(count)}${colors.reset} ${pluralize(count, "entry", "entries")}`,
  );

  console.log();

  if (opts.dryRun) {
    const preview = await getKeyMembers(redis, type, 5);
    log.info(`Entries that would be cleared (showing up to 5)`);
    preview.forEach((entry) => log.key(entry));

    if (count > 5) {
      log.info(`  ... and ${formatNumber(count - 5)} more`);
    }

    return;
  }

  if (!opts.yes) {
    const confirmed = await confirm(
      `Delete ${label.toLowerCase()} cache (${formatNumber(count)} ${pluralize(count, "entry", "entries")})?`,
    );

    if (!confirmed) {
      log.info("Aborted");
      process.exit(0);
    }
  }

  if (await deleteKey(redis, key)) {
    log.success(`Deleted ${label.toLowerCase()} cache`);
  } else {
    log.error(`Failed to delete key: ${key}`);
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const availableTypes = EMAIL_CACHE_TYPES.join(", ");

  if (args.help) {
    printHelp("clear-emails", "Clear email validation cache keys from Redis", [
      { flag: "--all, -a", description: "Clear all four cache keys" },
      {
        flag: "--type, -t <type>",
        description: `Clear a specific cache key (${availableTypes})`,
      },
      {
        flag: "--dry-run, -d",
        description: "Preview what would be deleted without deleting",
      },
      { flag: "--yes, -y", description: "Skip confirmation prompt" },
      { flag: "--help, -h", description: "Show this help message" },
    ]);

    process.exit(0);
  }

  if (!args.all && !args.type) {
    log.error("Please specify --all or --type <type>");
    log.info(`Available types: ${availableTypes}`);
    log.info("Use --help for usage information");
    process.exit(1);
  }

  if (args.type && !EMAIL_CACHE_TYPES.includes(args.type as EmailCacheType)) {
    log.error(`Invalid type: ${args.type}`);
    log.info(`Available types: ${availableTypes}`);
    process.exit(1);
  }

  const redis = getRedisClient();

  console.log();

  if (args.dryRun) {
    log.warn("Dry run mode - no keys will be deleted");
    console.log();
  }

  const opts = { dryRun: args.dryRun, yes: args.yes };

  try {
    if (args.all) {
      // shows current state of all 4 cache keys
      log.info("Email validation cache:");

      let totalEntries = 0;
      const counts = new Map<EmailCacheType, number>();

      for (const type of EMAIL_CACHE_TYPES) {
        const count = await printCacheKeyInfo(redis, type);
        counts.set(type, count);
        totalEntries += count;
      }

      console.log();

      if (totalEntries === 0) {
        log.info("All cache keys are empty");
        process.exit(0);
      }

      if (args.dryRun) {
        log.info(
          `Dry run complete — ${formatNumber(totalEntries)} entries would be cleared`,
        );

        process.exit(0);
      }

      if (!args.yes) {
        const confirmed = await confirm(
          `Delete all ${formatNumber(totalEntries)} cache entries across all four keys?`,
        );

        if (!confirmed) {
          log.info("Aborted");
          process.exit(0);
        }
      }

      let deletedKeys = 0;
      let deletedEntries = 0;

      for (const type of EMAIL_CACHE_TYPES) {
        /* 
          Skips buckets that were already empty in the counts above
        */
        if ((counts.get(type) ?? 0) === 0) continue;

        const { key, label } = EMAIL_CACHE_BUCKETS[type];

        if (await deleteKey(redis, key)) {
          log.success(`Deleted ${label.toLowerCase()} cache`);

          deletedKeys++;
          deletedEntries += counts.get(type) ?? 0;
        } else {
          log.error(`Failed to delete key: ${key}`);
        }
      }

      log.success(
        `Cleared ${deletedKeys} ${pluralize(deletedKeys, "key", "keys")} — ${formatNumber(deletedEntries)} ${pluralize(deletedEntries, "entry", "entries")} removed`,
      );
    } else if (args.type) {
      await clearSingleKey(redis, args.type as EmailCacheType, opts);
    }
  } catch (error) {
    log.error(`Failed to clear email validation cache keys: ${error}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
