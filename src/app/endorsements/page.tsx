import { EndorsementAlt } from './EndorsementsAlt'
import styles from '@/app/endorsements/endorsement.module.css'
import { ContentPageFrame } from '@/components/content_sections/ContentSections'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - EndorsementsAlt',
    description: 'Progressive Victory endorsements and supported candidates.',
    openGraph: {
        title: 'PV - EndorsementsAlt',
        description:
            'Progressive Victory endorsements and supported candidates.',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function EndorsementsAltPage() {
    return (
        <MainLayout>
            <HalftoneBackground />
            <ContentPageFrame
                heading={
                    <div className={styles.headingWrap}>
                        <p className={styles.heading}>
                            Endorsements{' '}
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
            <EndorsementAlt />
        </MainLayout>
    )
}
