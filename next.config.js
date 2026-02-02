/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-ready configuration
  reactStrictMode: true,
  
  // Prevent redirect loops
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  
  // Server configuration
  experimental: {
    // Speed up compilation
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js', 'react-google-recaptcha'],
    // Faster builds
    optimizeCss: true,
    // Parallel compilation
    webpackBuildWorker: true,
  },
  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      '@': './',
    },
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Reduce bundle size
  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
  // Speed up dev server
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Webpack optimizations for non-turbo mode
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: isServer ? undefined : 'single',
      splitChunks: isServer ? false : {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      },
    }
    return config
  },
}

module.exports = nextConfig
