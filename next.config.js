/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow network access for development
  allowedDevOrigins: [
    '192.168.1.113',
    'localhost',
  ],
  // Server configuration
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'https://localhost:3000',
        '192.168.1.113:3000',
        'https://192.168.1.113:3000',
      ],
    },
  },
  // Turbopack configuration (empty to silence warning)
  turbopack: {},
}

module.exports = nextConfig
