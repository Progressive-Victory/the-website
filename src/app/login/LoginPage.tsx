'use client'

import { LoginCard } from './LoginCard'
import styles from './login.module.css'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Suspense } from 'react'

export default function Login() {
    return (
        <MainLayout>
            <div className={styles.backgroundCover} />
            <HalftoneBackground />

            <div className={styles.body}>
                <Suspense>
                    <LoginCard />
                </Suspense>
                <div className={styles.footer}>
                    <InformationCircleIcon className={styles.infoIcon} />
                    By signing in you agree to our
                    <Link
                        href="/privacy"
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className={styles.hyper}
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}
