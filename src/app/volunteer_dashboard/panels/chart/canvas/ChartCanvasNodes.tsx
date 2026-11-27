'use client'

import styles from '../page.module.css'
import { DragPill, useDragAttributes } from './DragPill'
import { LineEditingContext } from './LineEditingContext'
import { linePointNodeType } from './linePointNodes'
import type { Seat } from './positionsToGraph'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import {
    Handle,
    NodeResizer,
    Position as HandlePosition,
    type NodeProps,
    type ResizeParams,
} from '@xyflow/react'
import type { Node } from '@xyflow/react'
import {
    createContext,
    useContext,
    useLayoutEffect,
    useRef,
    type CSSProperties,
} from 'react'

export const connectionRadius = 20

export const TitleHeightContext = createContext<
    (id: string, height: number) => void
>(() => undefined)

export const GroupResizeContext = createContext<
    ((id: string, box: ResizeParams) => void) | null
>(null)

type PositionNode = Node<{
    label: string
    seats: Seat[]
}>

function PositionHandle({
    side,
}: {
    side: 'top' | 'left' | 'right' | 'bottom'
}) {
    const { showHitboxes, editing } = useContext(LineEditingContext)
    const position = {
        top: HandlePosition.Top,
        left: HandlePosition.Left,
        right: HandlePosition.Right,
        bottom: HandlePosition.Bottom,
    }[side]
    return (
        <Handle
            id={side}
            type="source"
            position={position}
            className={styles.positionHandle}
            style={
                {
                    '--handle-hitbox-diameter': `${connectionRadius * 2}px`,
                } as CSSProperties
            }
        >
            {showHitboxes && editing && (
                <span
                    data-testid="handle-snap-hitbox"
                    aria-hidden="true"
                    className={styles.handleSnapHitbox}
                />
            )}
        </Handle>
    )
}

function NodeTitle({
    id,
    label,
    group = false,
}: {
    id: string
    label: string
    group?: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)
    const reportHeight = useContext(TitleHeightContext)
    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return
        const measure = () => reportHeight(id, element.offsetHeight)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => observer.disconnect()
    }, [id, label, group, reportHeight])
    return (
        <div
            ref={ref}
            className={group ? styles.groupTitle : styles.positionTitle}
        >
            {label}
        </div>
    )
}

function SeatRows({ seats }: { seats: Seat[] }) {
    return (
        <>
            {seats.map((seat, index) => (
                <div className={styles.seatRow} key={index}>
                    {seat.userId === null ? (
                        'Unfilled Seat'
                    ) : (
                        <>
                            <DiscordAvatar
                                discordUserId={seat.discordId}
                                imageId={seat.image ?? undefined}
                                size={24}
                            />
                            <span>
                                {seat.name ??
                                    (seat.username
                                        ? `@${seat.username}`
                                        : 'Unknown')}
                            </span>
                        </>
                    )}
                </div>
            ))}
        </>
    )
}

function PositionGroup({
    id,
    data,
    selected,
    dragging,
}: NodeProps<PositionNode>) {
    const { editing } = useContext(LineEditingContext)
    const onResizeEnd = useContext(GroupResizeContext)
    return (
        <div
            className={styles.group}
            data-selected={selected}
            {...useDragAttributes(id, dragging)}
        >
            <DragPill id={id} />
            <NodeResizer
                isVisible={editing && selected && !!onResizeEnd}
                minWidth={240}
                minHeight={140}
                onResizeEnd={(_, box) => onResizeEnd?.(id, box)}
            />
            <PositionHandle side="top" />
            <PositionHandle side="left" />
            <PositionHandle side="right" />
            <NodeTitle id={id} label={data.label} group />
            <SeatRows seats={data.seats} />
            <PositionHandle side="bottom" />
        </div>
    )
}

function PositionSeats({
    id,
    data,
    selected,
    dragging,
}: NodeProps<PositionNode>) {
    return (
        <div
            className={styles.positionNode}
            data-selected={selected}
            {...useDragAttributes(id, dragging)}
        >
            <DragPill id={id} />
            <PositionHandle side="top" />
            <PositionHandle side="left" />
            <PositionHandle side="right" />
            <NodeTitle id={id} label={data.label} />
            <SeatRows seats={data.seats} />
            <PositionHandle side="bottom" />
        </div>
    )
}

function LinePointSelection({ id, selected }: NodeProps) {
    return (
        <div className={styles.linePointSelection} data-selected={selected}>
            <DragPill id={id} />
        </div>
    )
}

export const nodeTypes = {
    positionGroup: PositionGroup,
    positionSeats: PositionSeats,
    [linePointNodeType]: LinePointSelection,
}
