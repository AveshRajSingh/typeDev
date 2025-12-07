/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize navigation and reduce unnecessary re-renders
  reactStrictMode: true,
  
  // Disable automatic static optimization for dynamic routes
  // This prevents full page reloads on navigation
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
