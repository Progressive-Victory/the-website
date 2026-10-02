'use client'

import styles from './components.module.css'
import { NodeHandles, SeatCard, type SeatInfo } from './nodeBase'
import type { Node, NodeProps } from '@xyflow/react'

export interface ChartNodeData extends Record<string, unknown> {
    positionId: number
    title?: string
    seat: SeatInfo
}

export type ChartNode = Node<ChartNodeData, 'chartNode'>

export function ChartNode({ data, selected }: NodeProps<ChartNode>) {
    return (
        <>
            <NodeHandles />
            <div className={styles.nodeShell}>
                <SeatCard
                    seat={data.seat}
                    title={data.title}
                    selected={selected}
                />
            </div>
        </>
    )
}
