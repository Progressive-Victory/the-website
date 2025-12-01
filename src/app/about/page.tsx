import { AboutContent } from './AboutContent'
import styles from '@/app/styles/components/ContentSections.module.css'
import { HalftoneBackground } from '@/components/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - About',
    description: 'Learn about Progressive Victory!',
    openGraph: {
        title: 'PV - About',
        description: 'Learn about Progressive Victory!',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function About() {
    return (
        <MainLayout>
            <div className={styles.container}>
                <HalftoneBackground />
                <AboutContent />
            </div>
        </MainLayout>
    )
}
