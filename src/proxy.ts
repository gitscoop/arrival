import { NextResponse } from "next/server";
import { config as appConfig } from "@/lib/config";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const { signIn, signUp, waitlist, home, invitationAccept, terms, privacy } =
  appConfig.routes;

const isPublicRoute = createRouteMatcher([
  waitlist,
  `${invitationAccept}(.*)`,
  `${signUp}(.*)`,
  `${signIn}(.*)`,
  "/api/webhooks(.*)",
  "/api/workflows(.*)",
  `${terms}(.*)`,
  `${privacy}(.*)`,
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const clerkTicket = nextUrl.searchParams.get("__clerk_ticket");

  if (clerkTicket && !pathname.startsWith(invitationAccept)) {
    const invitationAcceptUrl = nextUrl.clone();
    invitationAcceptUrl.pathname = invitationAccept;
    return NextResponse.redirect(invitationAcceptUrl);
  }

  if (pathname.startsWith(invitationAccept) && !clerkTicket) {
    return NextResponse.redirect(new URL(signUp, req.url));
  }

  const { userId } = await auth();

  if (userId) {
    if (
      pathname === waitlist ||
      pathname.startsWith(signUp) ||
      pathname.startsWith(signIn) ||
      pathname.startsWith(invitationAccept)
    ) {
      return NextResponse.redirect(new URL(home, req.url));
    }

    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    return NextResponse.redirect(new URL(waitlist, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // skips Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // always runs for API routes
    "/(api|trpc)(.*)",
  ],
};
