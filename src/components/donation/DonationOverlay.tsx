'use client'

import styles from './DonationOverlay.module.css'
import { MemberBanner } from '@/app/home'
import { createPortal } from 'react-dom'

interface DonationOverlayProps {
    handleShowOverlay: () => void
}

export function DonationOverlay({ handleShowOverlay }: DonationOverlayProps) {
    return createPortal(
        <div className={styles.overlay} onClick={handleShowOverlay}>
            <MemberBanner />
        </div>,
        document.body
    )
}
