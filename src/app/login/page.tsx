import { Suspense } from 'react'
import { LoginPage } from '@/components/LoginPage'
import { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL

if (!SITE_URL) throw Error('Please define the SITE_URL environment variable')

export const metadata: Metadata = {
    title: 'PV - Login',
    description: 'Log in and join the community',
    openGraph: {
        title: 'PV - Login',
        description: 'Log in and join the community',
        url: `https://${SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${SITE_URL}/images/banner.png` }],
    },
}

/**
 * A login page that displays a login form and handles authentication
 * with discord. The form is wrapped in a suspense boundary to avoid
 * a flash of unauthenticated content.
 */
export default function Login() {
    return (
        <Suspense>
            <LoginPage />
        </Suspense>
    )
}
