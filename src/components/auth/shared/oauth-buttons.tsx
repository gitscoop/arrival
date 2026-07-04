import * as Clerk from "@clerk/elements/common";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { HintBadge } from "@/components/auth/shared/hint-badge";

interface OAuthButtonsProps {
  isLoading: boolean;
  lastUsed: string | null;
  onProviderClick?: (
    strategy: "oauth_github" | "oauth_google",
  ) => void | Promise<void>;
  socialLoading?: string | null;
}

export function OAuthButtons({
  isLoading,
  lastUsed,
  onProviderClick,
  socialLoading,
}: OAuthButtonsProps) {
  const renderGithubButton = () => (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading || !!socialLoading}
      className="relative"
      aria-label={
        lastUsed === "github" ? "GitHub (last used method)" : undefined
      }
      aria-busy={isLoading || socialLoading === "oauth_github" || undefined}
      onClick={() => {
        if (onProviderClick) {
          onProviderClick("oauth_github");
        } else {
          localStorage.setItem("pendingAuthMethod", "github");
        }
      }}
    >
      {onProviderClick ? (
        socialLoading === "oauth_github" ? (
          <Icons.spinner data-icon="inline-start" />
        ) : (
          <Icons.gitHub data-icon="inline-start" />
        )
      ) : (
        <Clerk.Loading scope="provider:github">
          {(isGithubLoading) =>
            isGithubLoading ? (
              <Icons.spinner data-icon="inline-start" />
            ) : (
              <Icons.gitHub data-icon="inline-start" />
            )
          }
        </Clerk.Loading>
      )}
      GitHub
      {lastUsed === "github" && <HintBadge>Last used</HintBadge>}
    </Button>
  );

  const renderGoogleButton = () => (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading || !!socialLoading}
      className="relative"
      aria-label={
        lastUsed === "google" ? "Google (last used method)" : undefined
      }
      aria-busy={isLoading || socialLoading === "oauth_google" || undefined}
      onClick={() => {
        if (onProviderClick) {
          onProviderClick("oauth_google");
        } else {
          localStorage.setItem("pendingAuthMethod", "google");
        }
      }}
    >
      {onProviderClick ? (
        socialLoading === "oauth_google" ? (
          <Icons.spinner data-icon="inline-start" />
        ) : (
          <Icons.google data-icon="inline-start" />
        )
      ) : (
        <Clerk.Loading scope="provider:google">
          {(isGoogleLoading) =>
            isGoogleLoading ? (
              <Icons.spinner data-icon="inline-start" />
            ) : (
              <Icons.google data-icon="inline-start" />
            )
          }
        </Clerk.Loading>
      )}
      Google
      {lastUsed === "google" && <HintBadge>Last used</HintBadge>}
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      {onProviderClick ? (
        <>
          {renderGithubButton()}
          {renderGoogleButton()}
        </>
      ) : (
        <>
          <Clerk.Connection name="github" asChild>
            {renderGithubButton()}
          </Clerk.Connection>

          <Clerk.Connection name="google" asChild>
            {renderGoogleButton()}
          </Clerk.Connection>
        </>
      )}
    </div>
  );
}
