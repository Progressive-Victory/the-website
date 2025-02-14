import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // set allowed image hosts
    images: {
        domains: ['picsum.photos'],
    },
}

export default nextConfig
