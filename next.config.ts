import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb", // Slightly higher than Supabase limit for processing
    },
  },
};

export default nextConfig;
