import { Metadata } from 'next'
import { MainLayout } from '@/components/layout'
import FAQ from './FAQ'
import AboutCards from './AboutCards'

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

/**
 * The About page.
 *
 * This page explains the purpose and goals of Progressive Victory, and how it
 * works.
 *
 * The page is divided into sections, each explaining a different aspect of
 * Progressive Victory. The sections are: Our Community, How it Works, and
 * Values.
 *
 * @returns The About page.
 */
export default function About() {
    return (
        <MainLayout>
            {/* Halftone background */}
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />

            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 py-10">
                <AboutCards />
                <FAQ />
            </div>
        </MainLayout>
    )
}

