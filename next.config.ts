import type { NextConfig } from "next";

// Baseline security headers applied to every route. CSP is intentionally
// left out for now — adopting a strict CSP requires a per-request nonce
// integration with Next.js inline scripts, which is tracked separately in
// md/ProductionReadiness.md.
// COOP/COEP opt the document into cross-origin isolation, which
// unblocks OffscreenCanvas + SharedArrayBuffer — both useful for
// R3F's GLB decode + LOD streaming (PRD §82). Without this some
// browsers throttle 3D work to a single thread.
const crossOriginIsolationHeaders = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/:path*",
        headers: crossOriginIsolationHeaders,
      },
    ];
  },
};

export default nextConfig;
