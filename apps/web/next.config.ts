import type { NextConfig } from "next";

const INTERNAL_PACKAGES = ["@repo/api", "@repo/ui-web"];

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        hostname: " -s3-bucket.s3.us-east-1.amazonaws.com",
      },
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: INTERNAL_PACKAGES,
  experimental: {
    optimizePackageImports: INTERNAL_PACKAGES,
  },
};

export default config;
