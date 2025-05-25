import { Account } from '@/components/Account'
import { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL

if (!SITE_URL) throw Error('Please define the SITE_URL environment variable')

export const metadata: Metadata = {
    title: 'PV - Account',
    description: 'Manage your PV Account',
    openGraph: {
        title: 'PV - Account',
        description: 'Manage your PV Account',
        url: `https://${SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${SITE_URL}/images/banner.png` }],
    },
}
export default function AccountPage() {
    return <Account />
}
