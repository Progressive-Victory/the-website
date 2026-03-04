import { Metadata } from 'next'
import { redirect, RedirectType } from 'next/navigation'

export const metadata: Metadata = {
    title: 'PV - Admin',
    description: 'Portal for Administration of the Website and Database',
    openGraph: {
        title: 'PV - Admin',
        description: 'Portal for Administration of the Website and Database',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

export default function Page() {
    redirect('/admin/panels/members', RedirectType.replace)
}
