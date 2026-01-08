import {
    ContentPageFrame,
    ContentSection,
} from '@/components/content_sections/ContentSections'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
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

const styles = {
    heading: {
        width: '100%',
        textAlign: 'center' as const,
        fontSize: '2rem',
        fontWeight: 700,
        color: 'white',
    },
    headingHighlight: {
        color: '#09223a',
    },
    body: {
        whiteSpace: 'pre-line' as const,
        paddingTop: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
}

export default function NotFound() {
    return (
        <MainLayout>
            <HalftoneBackground opacity={0.1} />

            <ContentPageFrame
                heading={
                    <p style={styles.heading}>
                        Oops!{' '}
                        <span style={styles.headingHighlight}>
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
                    <p style={styles.body}>
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
