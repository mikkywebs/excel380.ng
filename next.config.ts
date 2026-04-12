import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.excel380.ng",
          },
        ],
        destination: "https://excel380.ng/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
