import { config } from "@/lib/config";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { ClerkAPIError } from "@/types/clerk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (!path) return config.app.url;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.app.url}${normalizedPath}`;
}

export function isClerkAPIResponseError(
  error: unknown,
): error is { errors: ClerkAPIError[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown }).errors)
  );
}

export function resolveCssVariable(
  el: Element,
  variableName?: string,
): string | null {
  if (!variableName) return null;

  const normalized = variableName.startsWith("--")
    ? variableName
    : `--${variableName}`;

  const fromEl = getComputedStyle(el).getPropertyValue(normalized).trim();

  if (fromEl) return fromEl;

  const root = document.documentElement;
  const fromRoot = getComputedStyle(root).getPropertyValue(normalized).trim();

  return fromRoot || null;
}

export function detectDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;

  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;

  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}
