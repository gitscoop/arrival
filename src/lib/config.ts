function routeFromEnv(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function appOriginFromEnv(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed).origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be a full URL origin, including https://",
    );
  }
}

function requireAppUrl(value: string | undefined) {
  const url = appOriginFromEnv(value);

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
  }

  return url;
}

export const config = {
  app: {
    name: "Gitscoop",
    contactEmail: "nabarun@gitscoop.com",
    url: requireAppUrl(process.env.NEXT_PUBLIC_APP_URL),
    social: {
      github: "https://github.com/gitscoop",
      x: "https://x.com/gitscoop",
    },
  },
  email: {
    from: {
      auth: "Gitscoop <auth@ops.gitscoop.com>",
      chief: "Nabarun from Gitscoop <chief@ops.gitscoop.com>",
    },
  },
  routes: {
    signIn: routeFromEnv(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in"),
    signUp: routeFromEnv(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up"),
    waitlist: routeFromEnv(
      process.env.NEXT_PUBLIC_CLERK_WAITLIST_URL,
      "/waitlist",
    ),
    home: routeFromEnv(
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL ??
        process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
      "/",
    ),
    invitationAccept: "/invitation/accept",
    terms: "/terms",
    privacy: "/privacy",
  },
};
