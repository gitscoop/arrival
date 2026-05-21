/*
  Clears rate limit keys from Redis
 
  Usage:
    pnpm redis clear:ratelimit --all                       # Clear all rate limit keys (default scope: waitlist)
    pnpm redis clear:ratelimit --scope waitlist --all      # Clear all waitlist rate limit keys
    pnpm redis clear:ratelimit --scope global --all        # Clear all global rate limit keys
    pnpm redis clear:ratelimit --fingerprint <id>          # Clear waitlist keys for a specific fingerprint
    pnpm redis clear:ratelimit --scope global --ip <addr>  # Clear global keys for a specific IP
    pnpm redis clear:ratelimit --all --dry-run             # Preview what would be deleted
*/

import {
  getRedisClient,
  parseArgs,
  confirm,
  deleteKeys,
  getKeysByPattern,
  log,
  colors,
  formatNumber,
  pluralize,
  printHelp,
} from "./utils";

const SCOPES = {
  waitlist: "waitlist:ratelimit",
  global: "global:ratelimit",
} as const;

const DEFAULT_SCOPE: keyof typeof SCOPES = "waitlist";

type ScopeName = keyof typeof SCOPES;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const availableScopes = Object.keys(SCOPES).join(", ");

  if (args.help) {
    printHelp(
      "clear-ratelimit",
      `Clear rate limit keys from Redis.\n  Default scope: ${colors.cyan}${DEFAULT_SCOPE}${colors.reset}`,
      [
        {
          flag: "--scope, -s <name>",
          description: `Target specific rate limit (${availableScopes})`,
        },
        {
          flag: "--all, -a",
          description: "Clear all keys for the selected scope",
        },
        {
          flag: "--fingerprint, -f <id>",
          description: "Clear waitlist keys for a specific fingerprint",
        },
        {
          flag: "--ip, -i <addr>",
          description: "Clear global keys for a specific IP address",
        },
        {
          flag: "--dry-run, -d",
          description: "Preview what would be deleted without deleting",
        },
        { flag: "--yes, -y", description: "Skip confirmation prompt" },
        { flag: "--help, -h", description: "Show this help message" },
      ],
    );

    process.exit(0);
  }

  let scopeName: ScopeName = DEFAULT_SCOPE;

  if (args.scope) {
    if (args.scope in SCOPES) {
      scopeName = args.scope as ScopeName;
    } else {
      log.error(`Invalid scope: ${args.scope}`);
      log.info(`Available scopes: ${availableScopes}`);
      process.exit(1);
    }
  }

  const prefix = SCOPES[scopeName];

  /*
    Rejects flags that don't match the key model for the selected scope
  */
  if (args.fingerprint && scopeName !== "waitlist") {
    log.error(
      `--fingerprint targets composite fingerprint:ip keys — only valid for 'waitlist' scope`,
    );

    log.info(
      `To clear a specific IP from the global scope use: ${colors.cyan}--scope global --ip <addr>${colors.reset}`,
    );

    process.exit(1);
  }

  if (args.ip && scopeName !== "global") {
    log.error(`--ip targets IP-keyed entries — only valid for 'global' scope`);

    log.info(
      `To clear a specific fingerprint from the waitlist scope use: ${colors.cyan}--scope waitlist --fingerprint <id>${colors.reset}`,
    );

    process.exit(1);
  }

  const identifier = scopeName === "global" ? args.ip : args.fingerprint;

  if (!args.all && !identifier) {
    if (scopeName === "global") {
      log.error("Please specify --all or --ip <addr>");
    } else {
      log.error("Please specify --all or --fingerprint <id>");
    }

    log.info(`Current scope: ${colors.cyan}${scopeName}${colors.reset}`);
    log.info("Use --help for usage information");
    process.exit(1);
  }

  const redis = getRedisClient();

  console.log();

  if (args.dryRun) {
    log.warn("Dry run mode - no keys will be deleted");
    console.log();
  }

  log.info(`Scope: ${colors.cyan}${scopeName}${colors.reset}`);

  try {
    const pattern = args.all ? `${prefix}:*` : `${prefix}:${identifier}*`;
    const keys = await getKeysByPattern(redis, pattern);

    if (keys.length === 0) {
      log.info("No rate limit keys found");
      process.exit(0);
    }

    log.info(
      `Found ${colors.bright}${formatNumber(keys.length)}${colors.reset} ${pluralize(keys.length, "key", "keys")}`,
    );

    console.log();

    const DRY_RUN_LIMIT = 15;

    if (args.dryRun) {
      log.info("Keys that would be deleted:");
      keys.slice(0, DRY_RUN_LIMIT).forEach((key) => log.key(key));

      if (keys.length > DRY_RUN_LIMIT) {
        log.info(`  ... and ${formatNumber(keys.length - DRY_RUN_LIMIT)} more`);
      }

      console.log();

      log.info(
        `Dry run complete — ${formatNumber(keys.length)} ${pluralize(keys.length, "key", "keys")} would be deleted`,
      );

      process.exit(0);
    }

    if (!args.yes) {
      /*
        Targeted deletes list exact keys before asking for confirmation
      */
      if (identifier) {
        log.info("Keys that will be deleted:");
        keys.forEach((key) => log.key(key));
      }

      console.log();

      const identifierLabel =
        scopeName === "global"
          ? `IP '${args.ip}'`
          : `fingerprint '${args.fingerprint}'`;

      const msg = args.all
        ? `Delete ${formatNumber(keys.length)} rate limit ${pluralize(keys.length, "key", "keys")} for scope '${scopeName}'?`
        : `Delete ${formatNumber(keys.length)} rate limit ${pluralize(keys.length, "key", "keys")} for ${identifierLabel} in scope '${scopeName}'?`;

      const confirmed = await confirm(msg);

      if (!confirmed) {
        log.info("Aborted");
        process.exit(0);
      }
    }

    const deleted = await deleteKeys(redis, keys);

    log.success(
      `Deleted ${formatNumber(deleted)} rate limit ${pluralize(deleted, "key", "keys")}`,
    );
  } catch (error) {
    log.error(`Failed to clear rate limit keys: ${error}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
