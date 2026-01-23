import Endorsements from './Endorsements'
import { ContentPageFrame } from '@/components/content_sections/ContentSections'
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

            <ContentPageFrame
                heading={
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <p
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '2.25rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                margin: 0,
                            }}
                        >
                            Endorsements{' '}
                            <span style={{ color: '#09223a' }}>for 2026</span>
                        </p>

                        <p
                            style={{
                                margin: 0,
                                textAlign: 'center',
                                maxWidth: '52rem',
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                            }}
                        >
                            Learn about each of the candidates we are
                            supporting.
                        </p>
                    </div>
                }
            >
                <Endorsements />
            </ContentPageFrame>
        </MainLayout>
    )
}
