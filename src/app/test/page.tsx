import TestContent from './TestContent'
import { HalftoneBackground } from '@/components/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - Button Playground',
    description: 'Test buttons.',
    openGraph: {
        title: 'PV - Button Playground',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

export default function Page() {
    return (
        <MainLayout>
            <HalftoneBackground opacity={0.1} />
            <TestContent />
        </MainLayout>
    )
}
