"use client";

import { config } from "@/lib/config";
import { Analytics } from "@vercel/analytics/next";
import type { BeforeSendEvent } from "@vercel/analytics";

function sanitizeAnalyticsEvent(event: BeforeSendEvent) {
  if (event.url.includes(config.routes.invitationAccept)) {
    return null;
  }

  const url = new URL(event.url);
  let modified = false;

  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      url.searchParams.delete(key);
      modified = true;
    }
  }

  return modified ? { ...event, url: url.toString() } : event;
}

export function VercelAnalytics() {
  return <Analytics beforeSend={sanitizeAnalyticsEvent} />;
}
