export const DEFAULT_POST_AUTH_PATH = "/";

export function safeRedirectPath(
  value: string | string[] | undefined,
): string {
  if (typeof value !== "string") return DEFAULT_POST_AUTH_PATH;
  if (!value.startsWith("/")) return DEFAULT_POST_AUTH_PATH;
  if (value.startsWith("//")) return DEFAULT_POST_AUTH_PATH;
  if (value.includes("\\")) return DEFAULT_POST_AUTH_PATH;
  return value;
}
