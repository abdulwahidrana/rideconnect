/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep native / CommonJS server-only packages out of the bundle.
  // Without this, Mongoose's internals break and `mongoose.models` is undefined.
  serverExternalPackages: ["mongoose", "bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;