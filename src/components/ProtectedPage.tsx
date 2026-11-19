import styles from '../app/login/login.module.css'
import { HalftoneBackground } from './halftone/HalftoneBackground'
import { MainLayout } from './layout'
import { AccessDenied } from '@/components/AccessDenied'
import { cookies } from 'next/headers'
import { ReactNode } from 'react'

interface ProtectedPageProps {
    children: ReactNode
    requiredPermissions: number[]
}

export async function ProtectedPage({
    children,
    requiredPermissions = [],
}: ProtectedPageProps) {
    const cookieStore = await cookies()
    const sessionCookies = cookieStore.getAll()

    const url = new URL('/me/hasPermissions', process.env.PV_WEBSITE_API_URL)
    requiredPermissions.forEach((perm) =>
        url.searchParams.append('perms', `${perm}`)
    )
    const sessionCookiesStr = sessionCookies
        .map((cookie) => `${encodeURI(cookie.name)}=${encodeURI(cookie.value)}`)
        .join('; ')
    const requestInit = {
        headers: { Cookie: sessionCookiesStr },
    } as RequestInit
    console.log(requestInit)
    console.log(url)
    const { accessGranted } = (await (
        await fetch(url, requestInit)
    ).json()) as {
        accessGranted: boolean
    }
    console.log(accessGranted)

    return !accessGranted ? (
        <MainLayout>
            <div className={styles.backgroundCover} />
            <HalftoneBackground />
            <div className={styles.body}>
                <AccessDenied message="You lack sufficient permissions to view this page." />
            </div>
        </MainLayout>
    ) : (
        children
    )
}
