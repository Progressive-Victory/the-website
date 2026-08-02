import { AccountPage } from './AccountPage'
import { RedirectBanner } from './RedirectBanner'
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

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: Props) {
    const { redirect } = await searchParams
    const wasForceRedirected = redirect === 'true'
    return (
        <MainLayout>
            <HalftoneBackground />
            {wasForceRedirected && <RedirectBanner />}
            <AccountPage />
        </MainLayout>
    )
}
