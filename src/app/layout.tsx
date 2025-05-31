import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import 'leaflet/dist/leaflet.css'
import './globals.css'

export const metadata: Metadata = {
    title: 'Progressive Victory',
    description: 'A new kind of online community for political action!',
    openGraph: {
        title: 'Progressive Victory',
        description: 'A new kind of online community for political action!',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700', '900'],
    display: 'swap',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script
                    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                    crossOrigin=""
                />
            </head>
            <body className={montserrat.className}>
                <Analytics />
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}
