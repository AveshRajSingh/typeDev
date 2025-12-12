/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize navigation and reduce unnecessary re-renders
  reactStrictMode: true,
  
  // Disable automatic static optimization for dynamic routes
  // This prevents full page reloads on navigation
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Headers for service worker and cache control
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        // Prevent caching of dynamic pages in development
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-store, must-revalidate' 
              : 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
