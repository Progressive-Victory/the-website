// page.tsx (Endorsements)
import EndorsementsClient from './EndorsementsClient'
import styles from '@/app/styles/pages/EndorsementsPage.module.css'
import { HalftoneBackground } from '@/components/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - Endorsements',
    description: 'Progressive Victory endorsements for 2026 candidates.',
    openGraph: {
        title: 'PV - Endorsements',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

export default function EndorsementsPage() {
    return (
        <MainLayout>
            <div className={styles.page}>
                <HalftoneBackground opacity={0.08} />
                <div className={styles.contentLayer}>
                    <EndorsementsClient />
                </div>
            </div>
        </MainLayout>
    )
}
