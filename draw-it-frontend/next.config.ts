import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  basePath: "/drawit",
  assetPrefix: "/drawit",
};

export default nextConfig;
