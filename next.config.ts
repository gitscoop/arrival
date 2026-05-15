import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

const allowedDevOrigins = [
  "gitscoop.localhost",
  appUrl ? new URL(appUrl).host : undefined,
].filter((origin): origin is string => Boolean(origin));

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default withBotId(nextConfig);
