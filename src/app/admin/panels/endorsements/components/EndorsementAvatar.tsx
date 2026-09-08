import styles from './EndorsementAvatar.module.css'
import { ElectionStatusBadge } from '@/app/endorsements/components/ElectionStatusBadge'
import { type ElectionStatus as PublicElectionStatus } from '@/app/endorsements/endorsements.data'
import { BackgroundColor, ElectionStatus, Endorsement } from '@/contracts/data'
import { cn } from '@/util'
import { FaUser } from 'react-icons/fa'

interface EndorsementAvatarProps {
    endorsement: Endorsement
    size?: number
    className?: string
}

const publicElectionStatuses: Record<ElectionStatus, PublicElectionStatus> = {
    [ElectionStatus.NoElection]: '',
    [ElectionStatus.UpcomingPrimary]: '',
    [ElectionStatus.WonPrimary]: 'Won Primary',
    [ElectionStatus.Elected]: 'Elected',
    [ElectionStatus.LostPrimary]: 'Lost Primary',
    [ElectionStatus.LostGeneral]: 'Lost General',
    [ElectionStatus.DroppedOut]: 'Dropped Out',
}

export function EndorsementAvatar({
    endorsement,
    size = 72,
    className,
}: EndorsementAvatarProps) {
    return (
        <div
            className={cn(
                styles.avatar,
                size < 70 && styles.avatarThinBorder,
                endorsement.avatarBgColor === BackgroundColor.Yellow
                    ? styles.avatarYellow
                    : styles.avatarBlue,
                className
            )}
            style={{ width: size, height: size }}
        >
            {endorsement.imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={endorsement.imgUrl} alt="" className={styles.image} />
            ) : (
                <FaUser className={styles.placeholder} />
            )}
            <span
                className={cn(
                    styles.badgeAnchor,
                    size < 70 && styles.badgeAnchorSmall
                )}
            >
                <ElectionStatusBadge
                    electionStatus={
                        publicElectionStatuses[endorsement.electionStatus]
                    }
                    tooltipPosition="bottom"
                />
            </span>
        </div>
    )
}
