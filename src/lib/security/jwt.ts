import crypto from "crypto";

/**
 * Enterprise Cryptographic Session Token & JWT Utilities for GradeFlow
 * Prevents:
 * 1. IDOR (Insecure Direct Object Reference)
 * 2. Session Hijacking / Token Tampering
 * 3. Side-channel Timing Attacks
 */

export interface SessionPayload {
  userId: string;
  email: string;
  fullName?: string;
  iat?: number;
  exp?: number;
}

export const SESSION_COOKIE_OPTIONS = {
  name: "gradeflow_session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  // Cryptographically deterministic fallback for local dev if not set
  return "gradeflow-enterprise-crypto-session-secret-salt-2026-v1";
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Creates an RFC 7519 HMAC-SHA256 (HS256) signed session JWT.
 */
export function signSessionToken(
  payload: Omit<SessionPayload, "iat" | "exp">,
  expiresInSeconds: number = SESSION_COOKIE_OPTIONS.maxAge
): string {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies and decodes an RFC 7519 HMAC-SHA256 (HS256) session JWT.
 * Validates cryptographic signature using constant-time comparison to prevent timing attacks.
 * Validates expiration timestamp (exp).
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const secret = getJwtSecret();
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Constant-time signature comparison to defeat timing attacks
  try {
    const bufA = Buffer.from(signature, "utf8");
    const bufB = Buffer.from(expectedSignature, "utf8");

    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return null;
    }

    if (!crypto.timingSafeEqual(bufA, bufB)) {
      return null;
    }
  } catch {
    return null;
  }

  // Parse and validate payload
  try {
    const jsonStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.userId || !payload.email) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
