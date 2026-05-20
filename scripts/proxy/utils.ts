import { join } from "node:path";
import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const MAX_PORT = 65_535;
const PORT_STOP_POLL_MS = 100;
const PORT_STOP_TIMEOUT_MS = 1_000;

// only warn once per run if Windows port inspection fails
let hasWarnedAboutWindowsPortInspection = false;

export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
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

export interface PortlessConfig {
  name?: string;
  appPort: number;
}

function coercePort(value: unknown): number | null {
  const port =
    typeof value === "string" && value.trim()
      ? Number(value)
      : typeof value === "number"
        ? value
        : null;

  if (
    port === null ||
    !Number.isInteger(port) ||
    port <= 0 ||
    port > MAX_PORT
  ) {
    return null;
  }

  return port;
}

export function readPortlessConfig(root: string): PortlessConfig {
  let settings: Record<string, unknown>;

  try {
    settings = JSON.parse(readFileSync(join(root, "portless.json"), "utf8"));
  } catch {
    log.error(
      `Could not read ${colors.cyan}portless.json${colors.reset} — ensure the file exists and contains valid JSON`,
    );

    process.exit(1);
  }

  const name =
    typeof settings.name === "string" && settings.name.trim()
      ? settings.name
      : undefined;

  const appPort = coercePort(settings.appPort);

  if (appPort === null) {
    log.error(
      `${colors.cyan}portless.json${colors.reset} must define a valid ${colors.cyan}appPort${colors.reset} (integer 1–${MAX_PORT})`,
    );

    process.exit(1);
  }

  return { name, appPort };
}

export function runPortlessPrune(root: string): {
  ok: boolean;
  output: string;
  error?: string;
} {
  /*
    On Windows, spawn through cmd so portless.cmd resolves from `node_modules/.bin`.
  */
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "portless";

  const args = isWindows
    ? ["/d", "/s", "/c", "portless.cmd", "prune"]
    : ["prune"];

  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
  });

  /*
    Portless writes status to either stream depending on the outcome
  */
  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .trim();

  if (result.status !== 0) {
    return {
      ok: false,
      output,
      error: output || "portless prune failed",
    };
  }

  return { ok: true, output };
}

/*
  Finds PIDs listening on a TCP port. Returns skipped=true on Windows when
  PowerShell isn't available - caller should treat that as a no-op, not a failure.
*/
function getPortListeners(port: number): { pids: string[]; skipped: boolean } {
  try {
    if (process.platform === "win32") {
      const found = execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `(Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess`,
        ],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        },
      ).trim();

      if (!found) return { pids: [], skipped: false };

      return {
        pids: [...new Set(found.split(/\s+/).filter(Boolean))],
        skipped: false,
      };
    }

    const found = execFileSync("lsof", [`-tiTCP:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (!found) return { pids: [], skipped: false };

    return {
      pids: [...new Set(found.split(/\s+/).filter(Boolean))],
      skipped: false,
    };
  } catch {
    if (process.platform === "win32" && !hasWarnedAboutWindowsPortInspection) {
      hasWarnedAboutWindowsPortInspection = true;

      log.warn(
        "Could not inspect Windows port listeners; port cleanup was skipped.",
      );

      log.info(
        `Ensure ${colors.cyan}powershell.exe${colors.reset} is available on PATH, or run this from a standard Windows developer terminal such as ${colors.cyan}PowerShell${colors.reset}, ${colors.cyan}Cursor${colors.reset}, or ${colors.cyan}VS Code${colors.reset}.`,
      );
    }

    return { pids: [], skipped: process.platform === "win32" };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ESRCH - process exited between lsof and kill
function isMissingProcessError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ESRCH";
}

// re-check lsof until the port is free or we hit the timeout
async function waitForPortListenersToExit(port: number): Promise<string[]> {
  const deadline = Date.now() + PORT_STOP_TIMEOUT_MS;
  let remaining = getPortListeners(port).pids;

  while (remaining.length > 0 && Date.now() < deadline) {
    await sleep(PORT_STOP_POLL_MS);
    remaining = getPortListeners(port).pids;
  }

  return remaining;
}

export async function killPortProcesses(port: number): Promise<{
  pids: string[];
  stopped: number;
  remaining: string[];
  skipped: boolean;
}> {
  const { pids, skipped } = getPortListeners(port);

  if (pids.length === 0) {
    return { pids, stopped: 0, remaining: [], skipped };
  }

  /* 
    Stage 1: SIGTERM — give the process a chance to shut down gracefully
  */
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch (error) {
      if (!isMissingProcessError(error)) {
        log.warn(`Could not stop process ${pid}: ${String(error)}`);
      }
    }
  }

  let remaining = await waitForPortListenersToExit(port);

  /* 
    Stage 2: SIGKILL — force-kill anything still alive after the graceful window
  */
  if (remaining.length > 0) {
    for (const pid of remaining) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch (error) {
        if (!isMissingProcessError(error)) {
          log.warn(`Could not force-stop process ${pid}: ${String(error)}`);
        }
      }
    }

    await sleep(PORT_STOP_POLL_MS);
    remaining = getPortListeners(port).pids;
  }

  const stopped = pids.filter((pid) => !remaining.includes(pid)).length;

  return { pids, stopped, remaining, skipped: false };
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}
