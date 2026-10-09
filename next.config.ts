import type { NextConfig } from "next";

/**
 * Security headers for every response. The CSP deliberately covers what can
 * be locked down without per-request nonces: no framing of the site
 * (clickjacking), no <base> hijacking, no plugins, forms post only to this
 * origin, and every subresource over HTTPS. Script sources are left open so
 * Next.js inline bootstrapping and the consented analytics keep working.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Allow next/image to serve product photos uploaded to Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Category pages were retired; old links and search results land on the
      // shop (search + sort) instead of a dead page.
      { source: "/shop/:category", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
