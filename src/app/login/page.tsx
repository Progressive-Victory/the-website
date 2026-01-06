import { LoginPage } from '@/app/login/LoginPage'
import { auth } from '@/util/auth'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'PV - Login',
    description: 'Log in and join the community',
    openGraph: {
        title: 'PV - Login',
        description: 'Log in and join the community',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

/**
 * A login page that displays a login form and handles authentication
 * with discord. The form is wrapped in a suspense boundary to avoid
 * a flash of unauthenticated content.
 */
export default async function Login({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>
}) {
    const session = await auth()
    const redirect_uri = (await searchParams).redirect || '/account'

    if (session) {
        redirect(redirect_uri)
    } else {
        return <LoginPage redirect={redirect_uri} />
    }
}
