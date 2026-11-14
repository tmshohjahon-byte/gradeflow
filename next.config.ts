import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: [
    "192.168.100.39",
    "192.168.100.39:3000",
    "*.lhr.life",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "*.ngrok.app",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent MIME-sniffing exploits
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Protect against Clickjacking attacks
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Legacy XSS filter activation
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer privacy protection
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Enforce HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Restrict unnecessary browser capabilities (anti-fingerprinting & camera/mic lockout)
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
