/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config to silence the warning
  turbopack: {},
  // Allow network access for development
  allowedDevOrigins: [
    '192.168.1.113',
    'localhost',
  ],
}

module.exports = nextConfig
