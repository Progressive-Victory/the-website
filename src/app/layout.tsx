import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
    title: 'Progressive Victory',
    description: 'A new kind of online community for political action!',
    openGraph: {
        title: 'Progressive Victory',
        description: 'A new kind of online community for political action!',
        url: `https://${process.env.VERCEL_URL}/`,
        siteName: 'Progressive Victory',
        images: [
            { url: `https://${process.env.VERCEL_URL}/images/banner.png` },
        ],
    },
}

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700', '900'],
    display: 'swap',
})
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={montserrat.className}>
                <Analytics />
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}
