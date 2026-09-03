import { Endorsements } from './Endorsements'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - Endorsements',
    description: 'Progressive Victory endorsements and supported candidates.',
    openGraph: {
        title: 'PV - Endorsements',
        description:
            'Progressive Victory endorsements and supported candidates.',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function EndorsementsPage() {
    return (
        <MainLayout>
            <HalftoneBackground />
            <Endorsements />
        </MainLayout>
    )
}
