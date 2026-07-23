export type KickboxResult =
  | "deliverable"
  | "undeliverable"
  | "risky"
  | "unknown";

export interface KickboxResponse {
  success: boolean;
  message: string | null;
  result: KickboxResult;
  reason: string;
  role: boolean;
  free: boolean;
  disposable: boolean;
  accept_all: boolean;
  did_you_mean: string | null;
  sendex: number;
  email: string;
  user: string;
  domain: string;
}

const KICKBOX_TIMEOUT_MS = 30_000;
const FETCH_TIMEOUT_MS = KICKBOX_TIMEOUT_MS + 3_000;

export async function verifyEmail(
  email: string,
  apiKey: string,
): Promise<KickboxResponse> {
  const url = new URL("https://api.kickbox.com/v2/verify");

  url.searchParams.set("email", email);
  url.searchParams.set("timeout", String(KICKBOX_TIMEOUT_MS));

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const data = (await response.json()) as KickboxResponse;

  if (!response.ok || !data.success) {
    throw new Error(
      `Kickbox request failed (${response.status}): ${data.message ?? "Unknown error"}`,
    );
  }

  return data;
}
