import bcrypt from "bcryptjs";

const BCRYPT_COST = 10;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashRefreshToken(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyRefreshToken(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateRefreshToken(userId: string): string {
  const secretBytes = new Uint8Array(32);
  crypto.getRandomValues(secretBytes);
  return `${userId}.${base64url(secretBytes)}`;
}

export function parseRefreshToken(
  token: string,
): { userId: string; secret: string } | null {
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  return { userId: token.slice(0, dot), secret: token.slice(dot + 1) };
}
