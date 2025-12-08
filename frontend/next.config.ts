import type { NextConfig } from "next";

const commonHost = {
  protocol: "http" as const,
  hostname: "localhost",
  port: "4000",
};

const paths = [
  "/public/storage/product/**",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: paths.map((pathname) => ({
      ...commonHost,
      pathname,
    })),
  },
  /* config options here */
};

export default nextConfig;
