import { type ElectionStatus } from '../endorsements.data'
import styles from './ElectionStatusBadge.module.css'
import { cn } from '@/util'

interface ElectionStatusBadgeProps {
    electionStatus: ElectionStatus
}

const badgeClass: Record<ElectionStatus, string | null> = {
    '': null,
    'Won Primary': styles.wonPrimary,
    Elected: styles.elected,
    'Lost Primary': styles.lost,
    'Lost General': styles.lost,
    'Dropped Out': styles.droppedOut,
}

export function ElectionStatusBadge({
    electionStatus,
}: ElectionStatusBadgeProps) {
    const className = badgeClass[electionStatus]

    if (!className) return null

    const icon = (() => {
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
    })()

    return (
        <span
            className={cn(styles.badge, className)}
            aria-label={`Election status: ${electionStatus}`}
        >
            <span aria-hidden="true">{icon}</span>
            <span className={styles.tooltip} aria-hidden="true">
                {electionStatus}
            </span>
        </span>
    )
}
