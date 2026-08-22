import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const backendBaseUrl = process.env.BACKEND_WS_BASE_URL;

    if (!backendBaseUrl) {
      return [];
    }

    const normalizedBaseUrl = backendBaseUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/v1/ws/:lang",
        destination: `${normalizedBaseUrl}/api/v1/ws/:lang`,
      },
    ];
  },
};

export default nextConfig;
