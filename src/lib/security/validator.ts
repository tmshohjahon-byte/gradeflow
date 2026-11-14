/**
 * Input Validation & Sanitization Engine
 * Protects against Injection attacks, XSS, and Header Smuggling.
 */

// Standard robust W3C-compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return false;

  // Prevent CRLF injection (SMTP Header Injection: \r, \n, \0, %0a, %0d)
  if (/[\r\n\0]|%0[ad]/i.test(clean)) return false;

  return EMAIL_REGEX.test(clean);
}

export function isValidOtpFormat(code: unknown): boolean {
  if (typeof code !== "string" && typeof code !== "number") return false;
  const str = code.toString().trim();
  return /^\d{6}$/.test(str);
}

export function sanitizeText(input: unknown, maxLength = 100): string {
  if (typeof input !== "string") return "";
  let clean = input.trim();

  // Strip control characters & null bytes
  clean = clean.replace(/[\x00-\x1F\x7F]/g, "");

  // Escape dangerous HTML entities to prevent XSS
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return clean.slice(0, maxLength);
}
