import { NextRequest } from "next/server";

/**
 * Enterprise In-Memory Sliding-Window Rate Limiter & Brute-force Shield
 * Prevents:
 * 1. Email Bombing / SMTP Quota Exhaustion
 * 2. Brute-force 6-digit guessing attacks
 * 3. DDoS / Rapid-fire API requests
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
};

if (!globalStore.__gradeflow_ip_limits__) {
  globalStore.__gradeflow_ip_limits__ = new Map();
}
if (!globalStore.__gradeflow_email_limits__) {
  globalStore.__gradeflow_email_limits__ = new Map();
}

const ipLimits = globalStore.__gradeflow_ip_limits__;
const emailLimits = globalStore.__gradeflow_email_limits__;

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
  }, 10 * 60 * 1000);
}

/**
 * Extract true client IP safely behind reverse proxies (Ngrok, Cloudflare, Nginx)
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
};

/**
 * Check if IP or Email is exceeding rate limits for sending OTP emails.
 * Rule:
 * 1. Resend cooldown: at least 45 seconds between requests for same email.
 * 2. Max 5 emails per hour per email address.
 * 3. Max 10 requests per 15 minutes per IP address.
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
      // Reset window
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

