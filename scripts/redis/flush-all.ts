/*
  Flushes the entire Redis database
 
  ⚠️  WARNING: This will delete ALL keys in the database and cannot be undone.
 
  Usage:
    pnpm redis flush             # Flush database (with confirmation)
    pnpm redis flush --yes       # Flush database (skip confirmation)
    pnpm redis flush --dry-run   # Preview what would be deleted
*/

import {
  getRedisClient,
  parseArgs,
  confirm,
  flushDatabase,
  getKeyCount,
  getKeysByPattern,
  KEY_PREFIXES,
  log,
  colors,
  formatNumber,
  pluralize,
  printHelp,
} from "./utils";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp("flush-all", "Flush the entire Redis database", [
      {
        flag: "--dry-run, -d",
        description: "Preview what would be deleted without deleting",
      },
      { flag: "--yes, -y", description: "Skip confirmation prompt" },
      { flag: "--help, -h", description: "Show this help message" },
    ]);

    process.exit(0);
  }

  const redis = getRedisClient();
  console.log();

  if (args.dryRun) {
    log.warn("Dry run mode - no keys will be deleted");
  }

  try {
    const keyCount = await getKeyCount(redis);

    if (keyCount === 0) {
      log.info("Database is already empty");
      process.exit(0);
    }

    console.log(
      [
        "",
        `  ${colors.red}${colors.bright}⚠️  WARNING: DESTRUCTIVE OPERATION${colors.reset}`,
        "",
        `  This will delete ${colors.bright}ALL ${formatNumber(keyCount)} ${pluralize(keyCount, "key", "keys")}${colors.reset} in the Redis database.`,
        `  This action cannot be undone.`,
        "",
      ].join("\n"),
    );

    // shows key breakdown by prefix
    const prefixes = KEY_PREFIXES;

    console.log(`  ${colors.bright}Key breakdown:${colors.reset}`);
    let knownCount = 0;

    for (const { prefix, label } of prefixes) {
      const keys = await getKeysByPattern(redis, prefix);

      if (keys.length > 0) {
        knownCount += keys.length;

        console.log(
          `  ${colors.cyan}${label.padEnd(25)}${colors.reset}${formatNumber(keys.length)}`,
        );
      }
    }

    // anything left after the known prefix breakdown
    const unknownCount = Math.max(0, keyCount - knownCount);

    if (unknownCount > 0) {
      console.log(
        `  ${colors.yellow}${"Other/Unknown keys".padEnd(25)}${colors.reset}${formatNumber(unknownCount)}`,
      );

      console.log();

      log.warn(
        `Unknown keys detected — run ${colors.cyan}'pnpm redis info'${colors.reset} for a full breakdown`,
      );
    }

    console.log();

    if (args.dryRun) {
      log.info("Dry run complete - no keys were deleted");
      process.exit(0);
    }

    if (!args.yes) {
      const confirmed = await confirm(
        `${colors.red}Are you absolutely sure you want to flush the database?${colors.reset}`,
      );

      if (!confirmed) {
        log.info("Aborted");
        process.exit(0);
      }

      /*
        Full database wipe gets a second confirmation on purpose
      */
      const doubleConfirmed = await confirm(
        `Confirm: permanently delete ALL ${formatNumber(keyCount)} ${pluralize(keyCount, "key", "keys")}? This cannot be undone`,
      );

      if (!doubleConfirmed) {
        log.info("Aborted");
        process.exit(0);
      }
    }

    log.info("Flushing database...");
    await flushDatabase(redis);

    log.success(
      `Database flushed — ${formatNumber(keyCount)} ${pluralize(keyCount, "key", "keys")} deleted`,
    );
  } catch (error) {
    log.error(`Failed to flush database: ${error}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
