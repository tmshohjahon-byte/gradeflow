import crypto from "crypto";

/**
 * Enterprise Cryptographic Utilities for GradeFlow
 * Prevents timing attacks, weak RNG, and insecure password storage.
 */

/**
 * Generate a cryptographically secure 6-digit OTP code using CSPRNG.
 * Far superior to Math.random() which is predictable.
 */
export function generateSecureOtp(): string {
  // crypto.randomInt is cryptographically secure (uses system entropy)
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Constant-time string comparison to prevent side-channel timing attacks.
 * Standard `===` or `!==` leaks timing information based on matching prefixes.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    if (bufA.length !== bufB.length) {
      // Execute dummy comparison to keep timing uniform
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Cryptographic Password Hashing with Salt
 * Format: `salt:hash` using PBKDF2 with SHA-256 (10,000 iterations)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored `salt:hash`
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const hashToTest = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha256")
    .toString("hex");

  return constantTimeCompare(originalHash, hashToTest);
}

