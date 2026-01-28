import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // For GitHub Pages - update this to your repo name
  basePath: process.env.NODE_ENV === "production" ? "/shopbuddy" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/shopbuddy/" : "",
};

export default nextConfig;
