import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true,
    },
    // set allowed image hosts
    images: {
        // Bucket URLs are content-addressed, so optimized output never goes stale.
        minimumCacheTTL: 60 * 60 * 24 * 31,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'dummyjson.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/pv_image_bucket/**',
            },
        ],
    },
}

export default nextConfig
