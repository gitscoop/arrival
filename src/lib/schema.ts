import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
});
