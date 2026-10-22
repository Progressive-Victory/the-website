'use client'

import styles from './page.module.css'
import { useCurrentUser } from '@/util/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import { FaArrowsRotate } from 'react-icons/fa6'

export default function Page() {
    const routeParams = useParams()
    const form = String(routeParams.form)

    const queryParams = useSearchParams()
    const refcode1 = queryParams.get('refcode')

    const loggedInUser = useCurrentUser()
    const refcode2 = loggedInUser.data?.discordUsers?.[0]?.id ?? null

    if (loggedInUser.error) {
        const redirectParams = new URLSearchParams()
        if (refcode1) redirectParams.append('refcode', refcode1)
        const redirect = `/donate/${form}?${redirectParams.toString()}`

        const url = new URL('/login', window.location.href)
        url.searchParams.append('redirect', redirect)
        location.replace(url)
    }

    if (loggedInUser.data) {
        const url = new URL(`https://secure.actblue.com/donate/${form}`)
        if (refcode1) url.searchParams.append('refcode', refcode1)
        if (refcode2) url.searchParams.append('refcode2', refcode2)
        location.replace(url)
    }

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <FaArrowsRotate className={styles.spinner} />
                <p className={styles.text}>Redirecting...</p>
            </div>
        </div>
    )
}
