import { AccountPage } from './AccountPage'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - Account',
    description: 'Manage your PV Account',
    openGraph: {
        title: 'PV - Account',
        description: 'Manage your PV Account',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function Page() {
    return (
        <MainLayout>
            <HalftoneBackground />
            <AccountPage />
        </MainLayout>
    )
}
