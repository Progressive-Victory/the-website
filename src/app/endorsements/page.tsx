import { Endorsements } from './Endorsements'
import styles from '@/app/endorsements/endorsement.module.css'
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
                    <div className={styles.headingWrap}>
                        <p className={styles.heading}>
                            Endorsements{' '}
                            {/* Will update to not hardcode 2026 in next revision */}
                            <span className={styles.headingHighlight}>
                                for 2026
                            </span>
                        </p>
                        <p className={styles.subheading}>
                            Learn about each of the candidates we are
                            supporting.
                        </p>
                    </div>
                }
            >
                <></>
            </ContentPageFrame>
            <Endorsements />
        </MainLayout>
    )
}
