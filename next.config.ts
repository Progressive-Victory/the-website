import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true,
    },
    // set allowed image hosts
    images: {
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
        ],
    },
}

export default nextConfig
