import { PrivacyContent } from './PrivacyContent'
import { HalftoneBackground } from '@/components/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - Privacy',
    description: 'Review our privacy policy.',
    openGraph: {
        title: 'PV - Privacy',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

export default function PrivacyPage() {
    return (
        <MainLayout>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                <HalftoneBackground />
                <PrivacyContent />
            </div>
        </MainLayout>
    )
}
