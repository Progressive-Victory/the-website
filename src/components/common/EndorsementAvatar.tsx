import { ElectionStatusBadge } from './ElectionStatusBadge'
import styles from './EndorsementAvatar.module.css'
import { ImageWithFallback } from './ImageWithFallback'
import { BackgroundColor, type Endorsement } from '@/contracts/data'
import { cn } from '@/util'
import { FaUser } from 'react-icons/fa'

export type EndorsementAvatarVariant = 'ring' | 'tile'

interface EndorsementAvatarProps {
    endorsement: Endorsement
    size?: number
    variant?: EndorsementAvatarVariant
    showBadge?: boolean
    badgeTooltipPosition?: 'top' | 'bottom'
    className?: string
}

// # TODO get design team to make red version of the artwork
const backgroundClass: Record<BackgroundColor, string> = {
    [BackgroundColor.Blue]: styles.blue,
    [BackgroundColor.Yellow]: styles.yellow,
    [BackgroundColor.Red]: styles.blue,
}

export function EndorsementAvatar({
    endorsement,
    size = 72,
    variant = 'ring',
    showBadge = true,
    badgeTooltipPosition = 'top',
    className,
}: EndorsementAvatarProps) {
    return (
        <div
            className={cn(
                styles.avatar,
                variant === 'ring' && styles.ring,
                variant === 'ring' && size < 70 && styles.thinBorder,
                variant === 'tile' && styles.tile,
                backgroundClass[endorsement.avatarBgColor],
                className
            )}
            style={{ width: size, height: size }}
        >
            {endorsement.imgHref ? (
                <ImageWithFallback
                    src={endorsement.imgHref}
                    alt={`${endorsement.name} profile image`}
                    width={size * 2}
                    height={size * 2}
                    className={styles.image}
                />
            ) : (
                <FaUser className={styles.placeholder} />
            )}
            {showBadge && (
                <span
                    className={cn(
                        styles.badgeAnchor,
                        size < 70 && styles.badgeAnchorSmall
                    )}
                >
                    <ElectionStatusBadge
                        electionStatus={endorsement.electionStatus}
                        tooltipPosition={badgeTooltipPosition}
                    />
                </span>
            )}
        </div>
    )
}
