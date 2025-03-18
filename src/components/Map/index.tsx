'use client'
import dynamic from 'next/dynamic'

export const Map = dynamic(
    () => import('./Map.client').then((mod) => mod.ClientMap),
    {
        ssr: false,
    }
)
