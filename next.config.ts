import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Clerk + Cloudflare CAPTCHA (Turnstile) + Google OAuth
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // Clerk + Cloudflare Turnstile + Google OAuth
      "connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://api.upstash.com https://challenges.cloudflare.com https://accounts.google.com",
      // Clerk iframes + Cloudflare Turnstile + Google OAuth
      "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://accounts.google.com",
      // Cloudflare Turnstile worker
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.clerk.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
