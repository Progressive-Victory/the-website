import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { getServerSession } from 'next-auth'
import './globals.css'

export const metadata: Metadata = {
    title: 'Progressive Victory',
    description: 'Get involved!',
}

const geist = Geist({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    display: 'swap',
})
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    const session = await getServerSession()
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={geist.className}>
                <AuthProvider session={session}>
                    {children}
                </AuthProvider>
                </body>
        </html>
    )
}
