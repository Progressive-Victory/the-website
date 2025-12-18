import notFoundStyles from '@/app/styles/pages/NotFoundPage.module.css'
import { ContentPageFrame, ContentSection } from '@/components/ContentSections'
import { HalftoneBackground } from '@/components/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - 404',
    description: '404 not found page.',
    openGraph: {
        title: 'PV - 404',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

export default function NotFound() {
    return (
        <MainLayout>
            <HalftoneBackground opacity={0.1} />

            <ContentPageFrame
                heading={
                    <p className={notFoundStyles.notFoundHeading}>
                        Oops!{' '}
                        <span
                            className={notFoundStyles.notFoundHeadingHighlight}
                        >
                            Page Not Found
                        </span>
                    </p>
                }
            >
                <ContentSection
                    title="Error 404"
                    titleAlign="left"
                    highlight="404"
                    highlightColor="#CE3728"
                >
                    <p className={notFoundStyles.notFoundBody}>
                        This page does not exist. It may have been moved,
                        deleted, or the URL might be incorrect.
                        {'\n\n'}
                        Please check the address or use the navigation above to
                        get back on track.
                    </p>
                </ContentSection>
            </ContentPageFrame>
        </MainLayout>
    )
}
