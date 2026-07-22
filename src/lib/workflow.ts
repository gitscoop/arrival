import "server-only";

import { requiredEnv } from "@/lib/env";
import { Client } from "@upstash/workflow";

export const workflowClient = new Client({
  token: requiredEnv("QSTASH_TOKEN"),
});
