import "server-only";

export function requiredEnv(key: string) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }

  return value;
}
