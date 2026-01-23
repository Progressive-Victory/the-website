import { TestPage } from '@/app/test/tweet'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: 'PV - Test',
    description: 'Test Progressive Victory!',
    openGraph: {
        title: 'PV - Test',
        description: 'Test Progressive Victory!',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function About() {
    return (
        <MainLayout>
            <TestPage />
            <HalftoneBackground />
        </MainLayout>
    )
}
