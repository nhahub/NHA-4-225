import { jwtVerify, SignJWT } from "jose";

const ALG = "HS256";
const ISSUER = "hadaf";
const ACCESS_TTL_SEC = 15 * 60;

function getSecret(): Uint8Array {
  const v = process.env.JWT_SECRET;
  if (!v || v.length === 0) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(v);
}

export type AccessClaims = {
  sub: string;
  iat: number;
  exp: number;
};

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(getSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
    });
    if (typeof payload.sub !== "string" || !payload.iat || !payload.exp) {
      return null;
    }
    return { sub: payload.sub, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}

export const ACCESS_TTL = ACCESS_TTL_SEC;
