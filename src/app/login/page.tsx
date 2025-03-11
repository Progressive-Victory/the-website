import { Suspense } from 'react'
import { LoginPage } from '@/components/LoginPage'

import { Metadata } from 'next'
export const metadata: Metadata = {
    title: 'PV - Login',
    description: 'Log in and join the community',
    openGraph: {
        title: 'PV - Login',
        description: 'Log in and join the community',
        url: `https://${process.env.VERCEL_URL}/`,
        siteName: 'Progressive Victory',
        images: [
            { url: `https://${process.env.VERCEL_URL}/images/banner.png` },
        ],
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
