import styles from './ElectionStatusBadge.module.css'
import { ElectionStatus } from '@/contracts/data'
import { ELECTION_STATUS_LABELS } from '@/models'
import { cn } from '@/util'

interface ElectionStatusBadgeProps {
    electionStatus: ElectionStatus
    tooltipPosition?: 'top' | 'bottom'
}

const badgeClass: Record<ElectionStatus, string | null> = {
    [ElectionStatus.NoElection]: null,
    [ElectionStatus.UpcomingPrimary]: null,
    [ElectionStatus.WonPrimary]: styles.wonPrimary,
    [ElectionStatus.Elected]: styles.elected,
    [ElectionStatus.LostPrimary]: styles.lost,
    [ElectionStatus.LostGeneral]: styles.lost,
    [ElectionStatus.DroppedOut]: styles.droppedOut,
}

export function ElectionStatusBadge({
    electionStatus,
    tooltipPosition = 'top',
}: ElectionStatusBadgeProps) {
    const className = badgeClass[electionStatus]

    if (!className) return null

    const label = ELECTION_STATUS_LABELS[electionStatus]

    const icon = (() => {
        switch (electionStatus) {
            case ElectionStatus.WonPrimary:
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
            case ElectionStatus.Elected:
                return '★'
            case ElectionStatus.LostPrimary:
            case ElectionStatus.LostGeneral:
                return '✕'
            case ElectionStatus.DroppedOut:
                return '−'
            default:
                return null
        }
    })()

    return (
        <span
            className={cn(styles.badge, className)}
            aria-label={`Election status: ${label}`}
        >
            <span aria-hidden="true">{icon}</span>
            <span
                className={cn(
                    styles.tooltip,
                    tooltipPosition === 'bottom' && styles.tooltipBottom
                )}
                aria-hidden="true"
            >
                {label}
            </span>
        </span>
    )
}
