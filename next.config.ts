import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the phone on the local network to load Next.js development assets
  // (HMR and client JavaScript) from this computer.
  allowedDevOrigins: ["10.32.94.150"],
};

export default nextConfig;
