import { StateGridMap } from './StateGridMap'
import { ContentPageFrame } from '@/components/content_sections/ContentSections'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - State Map',
    description: 'An interactive map of the United States.',
}

export default function StateMapPage() {
    return (
        <MainLayout>
            <ContentPageFrame heading={<p>State Map</p>}>
                <StateGridMap />
            </ContentPageFrame>
        </MainLayout>
    )
}
