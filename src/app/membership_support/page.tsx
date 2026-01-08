import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'PV - Membership Support',
    description: 'Learn about Progressive Victory!',
    openGraph: {
        title: 'PV - Membership Support',
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
    redirect('https://forms.gle/jbNftCSaqv416q3V6')

    return (
        <MainLayout>
            <HalftoneBackground />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
                Redirecting you to form...
            </div>
        </MainLayout>
    )
}
