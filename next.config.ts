import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads (default is 4MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Required for Prisma + bcryptjs on Vercel serverless
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  compress:        true,
  poweredByHeader: false,

  // Ignore TypeScript/ESLint errors during build (they're checked separately)
  typescript:   { ignoreBuildErrors: false },
  eslint:       { ignoreDuringBuilds: false },
}

export default nextConfig
