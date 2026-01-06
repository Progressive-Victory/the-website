import STUB_GET_USER from './stubGetUser'
import { auth } from '@/util/auth'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

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

export default async function AccountPage() {
    const session = await auth()

    if (!session) {
        redirect('/login?redirect=/account')
    }

    const userData = STUB_GET_USER()
    if (!userData) {
        // I'm assuming this means that the user hasn't completed onboarding, so redirect them to volunteer page
        // Is this assumption correct?
        redirect('/volunteer')
    }

    return <div></div>
}
