import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deliberately not using next/image — card images served via R2 / Cloudflare
  // with plain <img> tags to avoid Vercel image-optimization costs.
};

export default nextConfig;
