import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Progressive Victory',
    description: 'Get involved!',
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
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}
