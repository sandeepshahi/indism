/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "docs",
  basePath: "/indism",
  assetPrefix: "/indism",
  images: { unoptimized: true },
};

module.exports = nextConfig;
