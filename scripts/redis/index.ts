/*
  Redis Management CLI
 
  Unified entry point for all Redis management operations.
 
  Usage:
    pnpm redis <command> [options]
 
  Commands:
    clear:ratelimit   Clear rate limit keys
    clear:emails      Clear email validation cache keys
    flush             Flush entire database
    info              Show database info and key counts
 
  Examples:
    pnpm redis info
    pnpm redis clear:ratelimit --all
    pnpm redis clear:ratelimit --scope global --all
    pnpm redis clear:ratelimit --fingerprint abc123
    pnpm redis clear:emails --all
    pnpm redis clear:emails --type allowed
    pnpm redis flush --yes
*/

import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";

import {
  getRedisClient,
  getKeysByPattern,
  getKeyCount,
  KEY_PREFIXES,
  EMAIL_CACHE_BUCKETS,
  EMAIL_CACHE_TYPES,
  getEmailBucketSize,
  log,
  colors,
  formatNumber,
} from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS: Record<string, { script: string; description: string }> = {
  "clear:ratelimit": {
    script: "clear-ratelimit.ts",
    description: "Clear rate limit keys",
  },
  "clear:emails": {
    script: "clear-emails.ts",
    description: "Clear email validation cache keys",
  },
  flush: {
    script: "flush-all.ts",
    description: "Flush entire Redis database",
  },
};

function printUsage() {
  console.log(`
  ${colors.bright}Redis Management CLI${colors.reset}

  ${colors.bright}Usage:${colors.reset}
    pnpm redis <command> [options]

  ${colors.bright}Commands:${colors.reset}
    ${colors.cyan}clear:ratelimit${colors.reset}   Clear rate limit keys
    ${colors.cyan}clear:emails${colors.reset}      Clear email validation cache keys
    ${colors.cyan}flush${colors.reset}             Flush entire Redis database
    ${colors.cyan}info${colors.reset}              Show database info and key counts

  ${colors.bright}Examples:${colors.reset}
    ${colors.dim}# Inspect database state${colors.reset}
    pnpm redis info

    ${colors.dim}# Clear all waitlist rate limit keys (default scope)${colors.reset}
    pnpm redis clear:ratelimit --all

    ${colors.dim}# Clear all global (IP-level) rate limit keys${colors.reset}
    pnpm redis clear:ratelimit --scope global --all

    ${colors.dim}# Clear rate limit for specific fingerprint${colors.reset}
    pnpm redis clear:ratelimit --fingerprint abc123

    ${colors.dim}# Clear entire email validation cache${colors.reset}
    pnpm redis clear:emails --all

    ${colors.dim}# Clear only the 'allowed' cache bucket${colors.reset}
    pnpm redis clear:emails --type allowed

    ${colors.dim}# Dry run (preview without deleting)${colors.reset}
    pnpm redis clear:ratelimit --all --dry-run

    ${colors.dim}# Flush entire database${colors.reset}
    pnpm redis flush --yes

  ${colors.bright}Global Options:${colors.reset}
    ${colors.cyan}--help, -h${colors.reset}        Show this help
    ${colors.cyan}--dry-run, -d${colors.reset}     Preview what would be deleted
    ${colors.cyan}--yes, -y${colors.reset}         Skip confirmation prompts

  ${colors.dim}Run 'pnpm redis <command> --help' for detailed options on each command.${colors.reset}
  `);
}

async function showInfo() {
  const redis = getRedisClient();

  // shows just the hostname for environment confirmation
  const displayUrl = (process.env.UPSTASH_REDIS_REST_URL ?? "").replace(
    /^https?:\/\//,
    "",
  );

  /*
    Total key count without scanning every key in the database
  */
  const totalKeys = await getKeyCount(redis);

  const DIVIDER = `  ${"─".repeat(53)}`;
  console.log(`\n  ${colors.bright}Redis Database Info${colors.reset}`);

  if (displayUrl) {
    console.log(`  ${colors.dim}${displayUrl}${colors.reset}`);
  }

  console.log();

  // ── Rate Limits ───────────────────────────────────────────
  console.log(`  ${colors.bright}Rate Limits${colors.reset}`);
  console.log(DIVIDER);

  const rateLimitPrefixes = KEY_PREFIXES.filter((p) =>
    p.prefix.includes("ratelimit"),
  );

  let knownKeyCount = 0;
  let totalRateLimitKeys = 0;

  for (const { prefix, label, description } of rateLimitPrefixes) {
    const keys = await getKeysByPattern(redis, prefix);

    knownKeyCount += keys.length;
    totalRateLimitKeys += keys.length;

    const countStr = formatNumber(keys.length).padStart(8);

    console.log(
      `  ${colors.cyan}${label.padEnd(25)}${colors.reset}${countStr}  ${colors.dim}${description}${colors.reset}`,
    );
  }

  // ── Email Validation Cache ────────────────────────────────
  console.log();
  console.log(`  ${colors.bright}Email Validation Cache${colors.reset}`);
  console.log(DIVIDER);

  let totalEmailEntries = 0;

  for (const type of EMAIL_CACHE_TYPES) {
    const { label, description } = EMAIL_CACHE_BUCKETS[type];
    const count = await getEmailBucketSize(redis, type);

    totalEmailEntries += count;
    const countStr = formatNumber(count).padStart(8);

    console.log(
      `  ${colors.cyan}${label.padEnd(25)}${colors.reset}${countStr}  ${colors.dim}${description}${colors.reset}`,
    );
  }

  /*
    Scan the email bucket keys once for "known key" accounting
    (entry count ≠ key count - each bucket is 1 Redis key holding N entries)
  */
  const emailBucketKeys = await getKeysByPattern(redis, "waitlist:emails:*");
  knownKeyCount += emailBucketKeys.length;

  console.log(DIVIDER);

  console.log(
    `  ${"Total cached entries".padEnd(25)}${formatNumber(totalEmailEntries).padStart(8)}`,
  );

  // ── Summary ───────────────────────────────────────────────
  const unknownKeyCount = Math.max(0, totalKeys - knownKeyCount);

  if (unknownKeyCount > 0) {
    console.log();

    console.log(
      `  ${colors.yellow}${"Other/Unknown keys".padEnd(25)}${colors.reset}${formatNumber(unknownKeyCount).padStart(8)}  ${colors.dim}Keys with unrecognized prefixes${colors.reset}`,
    );
  }

  console.log(
    `\n  ${colors.bright}${"Total Redis keys:".padEnd(25)}${colors.reset}${formatNumber(totalKeys).padStart(8)}`,
  );

  // ── Hints ─────────────────────────────────────────────────
  console.log();

  if (totalRateLimitKeys === 0 && totalEmailEntries === 0) {
    log.success("Database is clean");
  } else {
    if (totalRateLimitKeys > 0) {
      log.info(
        `Run ${colors.cyan}'pnpm redis clear:ratelimit --all'${colors.reset} to clear rate limit keys`,
      );
    }

    if (totalEmailEntries > 0) {
      log.info(
        `Run ${colors.cyan}'pnpm redis clear:emails --all'${colors.reset} to clear the email cache`,
      );
    }
  }

  log.info(
    `Run ${colors.cyan}'pnpm redis <command> --help'${colors.reset} for detailed options on each command`,
  );

  console.log();
  process.exit(0);
}

async function runCommand(command: string, args: string[]) {
  const cmd = COMMANDS[command];

  if (!cmd) {
    log.error(`Unknown command: ${command}`);
    log.info('Use "pnpm redis --help" for usage information');
    process.exit(1);
  }

  const scriptPath = resolve(__dirname, cmd.script);

  /*
    On Windows, spawn through cmd so pnpm.cmd resolves from `node_modules/.bin`.
  */
  const isWindows = process.platform === "win32";
  const runner = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "pnpm";

  const runnerArgs = isWindows
    ? [
        "/d",
        "/s",
        "/c",
        "pnpm.cmd",
        "exec",
        "tsx",
        "--env-file=.env",
        scriptPath,
        ...args,
      ]
    : ["exec", "tsx", "--env-file=.env", scriptPath, ...args];

  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(runner, runnerArgs, {
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (command === "info") {
    await showInfo();
    return;
  }

  try {
    await runCommand(command, commandArgs);
  } catch (error) {
    const commandExited =
      error instanceof Error &&
      error.message.startsWith("Command exited with code");

    // only log spawn failures and not script exit codes
    if (error instanceof Error && !commandExited) {
      log.error(`Execution failed: ${error.message}`);
    }

    if (process.platform === "win32") {
      log.info(
        `If this is a Windows shell or PATH issue, ensure ${colors.cyan}pnpm${colors.reset} is available on PATH, or run this from a standard Windows developer terminal such as ${colors.cyan}PowerShell${colors.reset}, ${colors.cyan}Cursor${colors.reset}, or ${colors.cyan}VS Code${colors.reset}.`,
      );
    }

    process.exit(1);
  }
}

main();
