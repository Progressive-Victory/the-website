'use client'

import styles from './components.module.css'
import { DiscordAvatar } from '@/components/common'
import { cn } from '@/util'
import { Handle, Position, useStore } from '@xyflow/react'

export interface SeatInfo {
    name: string
    isUnfilled?: boolean
    discordUsername?: string
    discordUserId?: string
    discordImageId?: string
}

const HANDLE_POSITIONS = [
    Position.Top,
    Position.Right,
    Position.Bottom,
    Position.Left,
]

export function NodeHandles() {
    const isEditing = useStore((state) => state.nodesConnectable)
    const hasSelection = useStore((state) =>
        state.nodes.some((node) => node.selected)
    )
    const showHandles = isEditing && hasSelection

    return HANDLE_POSITIONS.map((position) => (
        <Handle
            key={position}
            id={position}
            type="source"
            position={position}
            className={cn(styles.handle, !showHandles && styles.handleHidden)}
        />
    ))
}

export interface SeatCardProps {
    seat: SeatInfo
    title?: string
    selected?: boolean
    linked?: boolean
    onSelect?: () => void
}

export function UserRow({ seat }: { seat: SeatInfo }) {
    return (
        <div className={styles.userRow}>
            <DiscordAvatar
                discordUserId={seat.discordUserId}
                imageId={seat.discordImageId}
                size={40}
                className={styles.avatar}
            />
            <div className={styles.details}>
                <span
                    className={cn(
                        styles.name,
                        seat.isUnfilled && styles.unfilled
                    )}
                >
                    {seat.name}
                </span>
                {seat.isUnfilled && (
                    <span className={styles.discordName}>@Username</span>
                )}
                {seat.discordUsername && (
                    <span className={styles.discordName}>
                        @{seat.discordUsername}
                    </span>
                )}
            </div>
        </div>
    )
}

export function SeatCard({
    seat,
    title,
    selected,
    linked,
    onSelect,
}: SeatCardProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                styles.nodeBody,
                selected && styles.selected,
                linked && styles.linked
            )}
        >
            <UserRow seat={seat} />
            {title && <span className={styles.title}>{title}</span>}
        </button>
    )
}
