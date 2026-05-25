import { config } from "@/lib/config";
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: config.routes.waitlist,
      method: "POST",
      advancedOptions: { checkLevel: "basic" },
    },
  ],
});
