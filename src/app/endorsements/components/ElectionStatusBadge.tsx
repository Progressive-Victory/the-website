import { type ElectionStatus } from '../endorsements.data'
import styles from './ElectionStatusBadge.module.css'
import { type ReactNode } from 'react'

interface ElectionStatusBadgeProps {
    electionStatus: ElectionStatus
}

export function ElectionStatusBadge({
    electionStatus,
}: ElectionStatusBadgeProps) {
    const className = getBadgeClassName(electionStatus)
    const icon = getBadgeIcon(electionStatus)

    if (!className) return null

    return (
        <span
            className={`${styles.badge} ${className}`}
            aria-label={`Election status: ${electionStatus}`}
        >
            <span aria-hidden="true">{icon}</span>
            <span className={styles.tooltip} aria-hidden="true">
                {electionStatus}
            </span>
        </span>
    )
}

function getBadgeClassName(electionStatus: ElectionStatus): string | null {
    if (electionStatus === 'Won Primary') {
        return styles.wonPrimary
    }
    if (electionStatus === 'Elected') {
        return styles.elected
    }
    if (
        electionStatus === 'Lost Primary' ||
        electionStatus === 'Lost General'
    ) {
        return styles.lost
    }
    if (electionStatus === 'Dropped Out') {
        return styles.droppedOut
    }
    return null
}

function getBadgeIcon(electionStatus: ElectionStatus): ReactNode {
    switch (electionStatus) {
        case 'Won Primary':
            return (
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M4.5 10.5l3.5 3.5 7-7"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )
        case 'Elected':
            return '★'
        case 'Lost Primary':
        case 'Lost General':
            return '✕'
        case 'Dropped Out':
            return '−'
        default:
            return null
    }
}
