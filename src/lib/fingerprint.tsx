"use client";

import FingerprintJS, { Agent } from "@fingerprintjs/fingerprintjs";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

interface FingerprintContextValue {
  visitorId: string | null;
  isLoading: boolean;
}

const FingerprintContext = createContext<FingerprintContextValue>({
  visitorId: null,
  isLoading: true,
});

export function useFingerprint() {
  const context = useContext(FingerprintContext);

  if (!context) {
    throw new Error("useFingerprint must be used within a FingerprintProvider");
  }

  return context;
}

export function FingerprintProvider({ children }: PropsWithChildren) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
    Loads a stable visitor id on mount and skips state updates if the provider unmounts first
  */
  useEffect(() => {
    let isMounted = true;
    let agent: Agent | null = null;

    const initFingerprint = async () => {
      try {
        agent = await FingerprintJS.load();
        const result = await agent.get();

        if (isMounted) {
          setVisitorId(result.visitorId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("FingerprintJS initialization failed:", error);

        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initFingerprint();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FingerprintContext.Provider value={{ visitorId, isLoading }}>
      {children}
    </FingerprintContext.Provider>
  );
}
