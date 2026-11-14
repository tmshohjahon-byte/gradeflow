import { generateSecureOtp } from "@/lib/security/crypto";

export type OtpRecord = {
  code: string;
  expiresAt: number;
  failedAttempts: number;
  fullName?: string;
  passwordHash?: string;
  gradeLevel?: string;
  createdAt: number;
};

// Global object to persist across hot-reloads in Node
const globalOtpStore = globalThis as unknown as {
  __gradeflow_server_otps__?: Map<string, OtpRecord>;
};

if (!globalOtpStore.__gradeflow_server_otps__) {
  globalOtpStore.__gradeflow_server_otps__ = new Map();
}

export const otpStore = globalOtpStore.__gradeflow_server_otps__;

// Automatic periodic purge of expired OTP entries (runs every 2 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [email, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(email);
      }
    }
  }, 2 * 60 * 1000);
}

export function setPendingOtp(
  email: string,
  params: {
    fullName?: string;
    passwordHash?: string;
    gradeLevel?: string;
  }
): { code: string; expiresAt: number } {
  const cleanEmail = email.toLowerCase().trim();
  const code = generateSecureOtp(); // Cryptographically secure 6-digit random code
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes TTL

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    failedAttempts: 0,
    fullName: params.fullName,
    passwordHash: params.passwordHash,
    gradeLevel: params.gradeLevel,
    createdAt: now,
  });

  return { code, expiresAt };
}

export function getPendingOtp(email: string): OtpRecord | undefined {
  return otpStore.get(email.toLowerCase().trim());
}

export function incrementFailedAttempts(email: string): number {
  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);
  if (!record) return 0;
  record.failedAttempts += 1;
  return record.failedAttempts;
}

export function deletePendingOtp(email: string) {
  otpStore.delete(email.toLowerCase().trim());
}
