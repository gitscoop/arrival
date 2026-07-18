"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/*
  Consumes a one-time error from the URL, then removes it so reload doesn't bring it back.
*/
export function useErrorParam(errorMessages: Record<string, string>): void {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
    Handles the error param when the URL includes one
  */
  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      const message = errorMessages[error] ?? errorMessages["default"];
      toast.error(message, { id: `error-param-${error}`, duration: 6000 });

      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);
}
