/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tree-shake icon imports so webpack does not pull a broken mega-chunk from lucide-react.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
