import { NextRequest } from "next/server";

/**
 * Enterprise In-Memory Sliding-Window Rate Limiter & Brute-force Shield
 * Prevents:
 * 1. Email Bombing / SMTP Quota Exhaustion
 * 2. Brute-force 6-digit guessing attacks
 * 3. Login credential stuffing / brute-force password cracking
 * 4. DDoS / Rapid-fire API requests
 */

type RateLimitRecord = {
  count: number;
  firstRequestTime: number;
  lastRequestTime: number;
};

// Global stores to persist across fast hot-reloads
const globalStore = globalThis as unknown as {
  __gradeflow_ip_limits__?: Map<string, RateLimitRecord>;
  __gradeflow_email_limits__?: Map<string, RateLimitRecord>;
  __gradeflow_login_ip_limits__?: Map<string, RateLimitRecord>;
  __gradeflow_login_email_limits__?: Map<string, RateLimitRecord>;
  __gradeflow_verify_ip_limits__?: Map<string, RateLimitRecord>;
};

if (!globalStore.__gradeflow_ip_limits__) {
  globalStore.__gradeflow_ip_limits__ = new Map();
}
if (!globalStore.__gradeflow_email_limits__) {
  globalStore.__gradeflow_email_limits__ = new Map();
}
if (!globalStore.__gradeflow_login_ip_limits__) {
  globalStore.__gradeflow_login_ip_limits__ = new Map();
}
if (!globalStore.__gradeflow_login_email_limits__) {
  globalStore.__gradeflow_login_email_limits__ = new Map();
}
if (!globalStore.__gradeflow_verify_ip_limits__) {
  globalStore.__gradeflow_verify_ip_limits__ = new Map();
}

const ipLimits = globalStore.__gradeflow_ip_limits__;
const emailLimits = globalStore.__gradeflow_email_limits__;
const loginIpLimits = globalStore.__gradeflow_login_ip_limits__;
const loginEmailLimits = globalStore.__gradeflow_login_email_limits__;
const verifyIpLimits = globalStore.__gradeflow_verify_ip_limits__;

// Periodic cleanup every 10 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipLimits.entries()) {
      if (now - record.firstRequestTime > 15 * 60 * 1000) {
        ipLimits.delete(key);
      }
    }
    for (const [key, record] of emailLimits.entries()) {
      if (now - record.firstRequestTime > 60 * 60 * 1000) {
        emailLimits.delete(key);
      }
    }
    for (const [key, record] of loginIpLimits.entries()) {
      if (now - record.firstRequestTime > 15 * 60 * 1000) {
        loginIpLimits.delete(key);
      }
    }
    for (const [key, record] of loginEmailLimits.entries()) {
      if (now - record.firstRequestTime > 15 * 60 * 1000) {
        loginEmailLimits.delete(key);
      }
    }
    for (const [key, record] of verifyIpLimits.entries()) {
      if (now - record.firstRequestTime > 15 * 60 * 1000) {
        verifyIpLimits.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Extract true client IP safely behind reverse proxies (Vercel, Cloudflare, Nginx)
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
  message?: string;
  remainingAttempts?: number;
};

/**
 * Check if IP or Email is exceeding rate limits for sending OTP emails.
 */
export function checkSendOtpRateLimit(
  clientIp: string,
  email: string
): RateLimitResult {
  const now = Date.now();
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check Email Resend Cooldown (45 seconds)
  const emailRecord = emailLimits.get(cleanEmail);
  if (emailRecord) {
    const elapsedSinceLast = now - emailRecord.lastRequestTime;
    const cooldownMs = 45 * 1000;

    if (elapsedSinceLast < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - elapsedSinceLast) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: waitSec,
        message: `Iltimos, qayta kod so'rashdan oldin ${waitSec} soniya kuting.`,
      };
    }

    // 2. Check Hourly limit (max 5 per hour)
    const elapsedWindow = now - emailRecord.firstRequestTime;
    if (elapsedWindow < 60 * 60 * 1000) {
      if (emailRecord.count >= 5) {
        const waitMin = Math.ceil((60 * 60 * 1000 - elapsedWindow) / (60 * 1000));
        return {
          allowed: false,
          retryAfterSeconds: waitMin * 60,
          message: `Ushbu email uchun soatlik limitga yetildi. Iltimos, ${waitMin} daqiqadan so'ng urinib ko'ring.`,
        };
      }
      emailRecord.count += 1;
      emailRecord.lastRequestTime = now;
    } else {
      emailLimits.set(cleanEmail, {
        count: 1,
        firstRequestTime: now,
        lastRequestTime: now,
      });
    }
  } else {
    emailLimits.set(cleanEmail, {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    });
  }

  // 3. Check IP Rate Limit (max 10 requests per 15 minutes)
  const ipRecord = ipLimits.get(clientIp);
  if (ipRecord) {
    const elapsedIpWindow = now - ipRecord.firstRequestTime;
    if (elapsedIpWindow < 15 * 60 * 1000) {
      if (ipRecord.count >= 10) {
        const waitMin = Math.ceil((15 * 60 * 1000 - elapsedIpWindow) / (60 * 1000));
        return {
          allowed: false,
          retryAfterSeconds: waitMin * 60,
          message: `IP manzilingizdan juda ko'p so'rovlar yuborildi. Xavfsizlik yuzasidan ${waitMin} daqiqa kuting.`,
        };
      }
      ipRecord.count += 1;
      ipRecord.lastRequestTime = now;
    } else {
      ipLimits.set(clientIp, {
        count: 1,
        firstRequestTime: now,
        lastRequestTime: now,
      });
    }
  } else {
    ipLimits.set(clientIp, {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    });
  }

  return { allowed: true };
}

/**
 * Check Login Brute-force Lockout:
 * Max 5 failed attempts in 15 minutes per IP or Email.
 */
export function checkLoginRateLimit(clientIp: string, email: string): RateLimitResult {
  const now = Date.now();
  const cleanEmail = email.toLowerCase().trim();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  // 1. Check IP lockout
  const ipRecord = loginIpLimits.get(clientIp);
  if (ipRecord && ipRecord.count >= maxAttempts) {
    const elapsed = now - ipRecord.firstRequestTime;
    if (elapsed < windowMs) {
      const waitMin = Math.max(1, Math.ceil((windowMs - elapsed) / 60000));
      return {
        allowed: false,
        retryAfterSeconds: waitMin * 60,
        message: `Xavfsizlik yuzasidan bloklandiniz (5 ta noto'g'ri urinish). Iltimos, ${waitMin} daqiqadan so'ng qayta urinib ko'ring.`,
      };
    } else {
      loginIpLimits.delete(clientIp);
    }
  }

  // 2. Check Email lockout
  if (cleanEmail) {
    const emailRecord = loginEmailLimits.get(cleanEmail);
    if (emailRecord && emailRecord.count >= maxAttempts) {
      const elapsed = now - emailRecord.firstRequestTime;
      if (elapsed < windowMs) {
        const waitMin = Math.max(1, Math.ceil((windowMs - elapsed) / 60000));
        return {
          allowed: false,
          retryAfterSeconds: waitMin * 60,
          message: `Ushbu hisob uchun ketma-ket 5 ta noto'g'ri urinish bo'ldi. 15 daqiqaga bloklandi (Qolgan vaqt: ${waitMin} daqiqa).`,
        };
      } else {
        loginEmailLimits.delete(cleanEmail);
      }
    }
  }

  return { allowed: true };
}

/**
 * Record a failed login attempt for IP and Email.
 * Returns the highest count of failed attempts.
 */
export function recordFailedLogin(clientIp: string, email: string): number {
  const now = Date.now();
  const cleanEmail = email.toLowerCase().trim();
  const windowMs = 15 * 60 * 1000;

  // IP Record
  const ipRec = loginIpLimits.get(clientIp);
  let ipCount = 1;
  if (ipRec && now - ipRec.firstRequestTime < windowMs) {
    ipRec.count += 1;
    ipRec.lastRequestTime = now;
    ipCount = ipRec.count;
  } else {
    loginIpLimits.set(clientIp, { count: 1, firstRequestTime: now, lastRequestTime: now });
  }

  // Email Record
  let emailCount = 1;
  if (cleanEmail) {
    const emailRec = loginEmailLimits.get(cleanEmail);
    if (emailRec && now - emailRec.firstRequestTime < windowMs) {
      emailRec.count += 1;
      emailRec.lastRequestTime = now;
      emailCount = emailRec.count;
    } else {
      loginEmailLimits.set(cleanEmail, { count: 1, firstRequestTime: now, lastRequestTime: now });
    }
  }

  return Math.max(ipCount, emailCount);
}

/**
 * Reset failed login attempts on successful authentication.
 */
export function resetLoginRateLimit(clientIp: string, email: string): void {
  const cleanEmail = email.toLowerCase().trim();
  loginEmailLimits.delete(cleanEmail);
  loginIpLimits.delete(clientIp);
}

/**
 * Check rate limit for verifying OTP from an IP (Max 15 verification attempts per 15 mins).
 */
export function checkVerifyOtpRateLimit(clientIp: string): RateLimitResult {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 15;

  const rec = verifyIpLimits.get(clientIp);
  if (rec) {
    const elapsed = now - rec.firstRequestTime;
    if (elapsed < windowMs) {
      if (rec.count >= maxAttempts) {
        const waitMin = Math.max(1, Math.ceil((windowMs - elapsed) / 60000));
        return {
          allowed: false,
          retryAfterSeconds: waitMin * 60,
          message: `IP manzilingizdan juda ko'p urinish bo'ldi. Iltimos, ${waitMin} daqiqadan so'ng urinib ko'ring.`,
        };
      }
      rec.count += 1;
      rec.lastRequestTime = now;
    } else {
      verifyIpLimits.set(clientIp, { count: 1, firstRequestTime: now, lastRequestTime: now });
    }
  } else {
    verifyIpLimits.set(clientIp, { count: 1, firstRequestTime: now, lastRequestTime: now });
  }

  return { allowed: true };
}
