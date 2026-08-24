import { Metadata } from 'next'
import { redirect, RedirectType } from 'next/navigation'

export const metadata: Metadata = {
    title: 'PV - Volunteer Dashboard',
    description:
        'A space for volunteers in PV to access resources and manage their activities',
    openGraph: {
        title: 'PV - Volunteer Dashboard',
        description:
            'A space for volunteers in PV to access resources and manage their activities',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function Page() {
    redirect('/volunteer_dashboard/panels/members', RedirectType.replace)
}
