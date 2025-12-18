import { Metadata } from 'next'
import { Account } from './Account'

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
export default function AccountPage() {
    return <Account />
}

