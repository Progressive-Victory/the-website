'use client'

import styles from './components.module.css'
import { NodeHandles, UserRow, type SeatInfo } from './nodeBase'
import { cn } from '@/util'
import type { Node, NodeProps } from '@xyflow/react'

export interface RosterNodeData extends Record<string, unknown> {
    positionId: number
    title?: string
    seats: SeatInfo[]
}

export type RosterNode = Node<RosterNodeData, 'rosterNode'>

export function RosterNode({ data, selected }: NodeProps<RosterNode>) {
    return (
        <>
            <NodeHandles />
            <div className={styles.nodeShell}>
                <div
                    className={cn(
                        styles.nodeBody,
                        styles.rosterBody,
                        selected && styles.selected
                    )}
                >
                    {data.title && (
                        <span className={styles.title}>{data.title}</span>
                    )}
                    <div className={styles.rosterRows}>
                        {data.seats.map((seat, seatIndex) => (
                            <UserRow key={seatIndex} seat={seat} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
