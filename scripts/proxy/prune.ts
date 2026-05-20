/*
  Prunes stale Portless routes and frees the dev server port

  Usage:
    pnpm dev:prune
*/

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import {
  colors,
  killPortProcesses,
  log,
  pluralize,
  readPortlessConfig,
  runPortlessPrune,
} from "./utils";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function logPortlessOutput(output: string): void {
  if (!output) return;

  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (trimmed) log.key(trimmed);
  }
}

async function main() {
  const settings = readPortlessConfig(ROOT);

  const appLabel = settings.name
    ? `${settings.name}.localhost`
    : "inferred from project";

  console.log();

  log.info(`App: ${colors.cyan}${appLabel}${colors.reset}`);
  log.info(`Port: ${colors.cyan}${settings.appPort}${colors.reset}`);

  console.log();

  try {
    log.info("Pruning stale Portless routes...");

    const pruneResult = runPortlessPrune(ROOT);

    if (!pruneResult.ok) {
      log.error(`Portless prune failed: ${pruneResult.error}`);
      process.exit(1);
    }

    if (pruneResult.output) {
      const noOp = /no orphaned routes found/i.test(pruneResult.output);

      if (noOp) {
        log.info("No stale Portless routes found");
      } else {
        logPortlessOutput(pruneResult.output);
        console.log();
        log.success("Portless routes pruned");
      }
    } else {
      log.info("No stale Portless routes found");
    }

    console.log();

    log.info(
      `Checking for processes on port ${colors.cyan}${settings.appPort}${colors.reset}...`,
    );

    const { pids, stopped, remaining, skipped } = await killPortProcesses(
      settings.appPort,
    );

    if (!skipped) {
      if (pids.length === 0) {
        log.info(`No process bound to port ${settings.appPort}`);
      } else {
        log.info(
          `Found ${colors.bright}${pids.length}${colors.reset} ${pluralize(pids.length, "process", "processes")}`,
        );

        for (const pid of pids) {
          log.key(`PID ${pid}`);
        }

        console.log();

        if (remaining.length === 0) {
          log.success(
            `Stopped ${stopped} ${pluralize(stopped, "process", "processes")} on port ${settings.appPort}`,
          );
        } else {
          log.warn(
            `${remaining.length} ${pluralize(remaining.length, "process", "processes")} still listening on port ${settings.appPort}`,
          );

          for (const pid of remaining) {
            log.key(`PID ${pid}`);
          }
        }
      }
    }

    console.log();

    /*
      "finished" not "complete" when port cleanup was skipped or something
      is still bound — stale routes may be gone but the port isn't free yet
    */
    if (remaining.length > 0 || skipped) {
      log.info("Dev proxy cleanup finished");
    } else {
      log.success("Dev proxy cleanup complete");
    }
  } catch (error) {
    log.error(`Unexpected error: ${error}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
