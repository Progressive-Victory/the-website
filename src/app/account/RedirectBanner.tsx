'use client'

import styles from './account.module.css'
import { useSearchParams } from 'next/navigation'

export const RedirectBanner = () => {
    const searchParams = useSearchParams()
    if (!(searchParams.get('redirect') === 'true')) return null
    return (
        <div className={styles.redirectBanner}>
            <div className={styles.redirectBannerContent}>
                <div>You&apos;ve already joined the Discord Community</div>
                <div>
                    Can&apos;t find it?{' '}
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                        target="_blank"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    )
}
