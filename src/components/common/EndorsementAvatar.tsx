'use client'

import { ElectionStatusBadge } from './ElectionStatusBadge'
import styles from './EndorsementAvatar.module.css'
import { ImageWithFallback } from './ImageWithFallback'
import { cn } from '@/util'
import { BackgroundColor, type Endorsement } from 'pv-contracts/data'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa'

export type EndorsementAvatarVariant = 'ring' | 'tile'

interface EndorsementAvatarProps {
    endorsement: Endorsement
    size?: number
    variant?: EndorsementAvatarVariant
    showBadge?: boolean
    badgeTooltipPosition?: 'top' | 'bottom'
    skeletonDelay?: number
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
    skeletonDelay,
    className,
}: EndorsementAvatarProps) {
    const [readySrc, setReadySrc] = useState<string>()
    const imgHref = endorsement.imgHref

    return (
        <div
            data-waiting={!!imgHref && readySrc !== imgHref}
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
            {imgHref ? (
                <ImageWithFallback
                    src={imgHref}
                    alt={`${endorsement.name} profile image`}
                    width={size}
                    height={size}
                    className={styles.image}
                    skeletonDelay={skeletonDelay}
                    onReady={() => setReadySrc(imgHref)}
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
