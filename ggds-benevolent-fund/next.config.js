/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features (removed optimizeCss due to build issue)
  
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression and performance
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Enable static optimization
  trailingSlash: false,
  reactStrictMode: true,
  
  // Build optimization
  // generateBuildId: async () => {
  //   // Use timestamp for build ID to avoid caching issues
  //   return `build-${Date.now()}`
  // },
  
  // Output settings for production deployments
  output: 'standalone',
  
  // Environment variables that should be available on the client
  env: {
    SITE_NAME: 'GGDS Benevolent Fund',
    SITE_DESCRIPTION: 'Grand Granite Diaspora Sacco Benevolent Fund - Supporting our members in times of need',
  },
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 0
            }
          }
        }
      }
    }
    
    return config
  },
  
  // Allowed dev origins for cross-origin requests
  allowedDevOrigins: ['127.0.0.1'],
  
  // Redirects (if needed)
  async redirects() {
    return [
      // Add any redirects here if needed
    ]
  },
  
  // Rewrites (if needed)
  async rewrites() {
    return [
      // Add any rewrites here if needed
    ]
  }
}

module.exports = nextConfig