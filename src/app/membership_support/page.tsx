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

export default function MembershipSupport() {
    redirect('https://forms.gle/jbNftCSaqv416q3V6')
}
