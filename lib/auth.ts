import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  SESSION_AUDIENCE,
  SESSION_COOKIE_NAME,
  SESSION_ISSUER,
  SESSION_MAX_AGE_SECONDS,
} from "./session-config";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET غير مضبوط أو قصير جداً (32+ بايت). افتحي .env.local"
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string;
  email: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error("ADMIN_EMAIL غير مضبوط في .env.local");
  return email;
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD غير مضبوط في .env.local");
  return password;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let dummy = 0;
    for (let i = 0; i < b.length; i++) dummy |= b.charCodeAt(i);
    void dummy;
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
