'use client'

import styles from './components.module.css'
import type { Node, NodeProps } from '@xyflow/react'

export interface PositionGroupData extends Record<string, unknown> {
    title: string
}

export type PositionGroupNode = Node<PositionGroupData, 'positionGroup'>

export function PositionGroup({
    data,
    selected,
}: NodeProps<PositionGroupNode>) {
    return (
        <div className={styles.groupBody} data-selected={selected}>
            <span className={styles.groupTitle}>{data.title}</span>
        </div>
    )
}
