'use client'

import styles from './components.module.css'
import { NodeHandles, SeatCard, type SeatInfo } from './nodeBase'
import { cn } from '@/util'
import type { Node, NodeProps } from '@xyflow/react'
import { Fragment, useState } from 'react'

export interface MultiSeatNodeData extends Record<string, unknown> {
    positionId: number
    title?: string
    seats: SeatInfo[]
}

export type MultiSeatNode = Node<MultiSeatNodeData, 'multiSeatNode'>

export function MultiSeatNode({ data, selected }: NodeProps<MultiSeatNode>) {
    const [selection, setSelection] = useState<number | 'all'>()
    const [isConnectorHovered, setIsConnectorHovered] = useState(false)
    const activeSelection = selected ? selection : undefined

    return (
        <>
            <NodeHandles />
            <div className={styles.nodeShell}>
                <div className={styles.seatRow}>
                    {data.seats.map((seat, seatIndex) => (
                        <Fragment key={seatIndex}>
                            <SeatCard
                                seat={seat}
                                title={data.title}
                                selected={
                                    activeSelection === 'all' ||
                                    activeSelection === seatIndex
                                }
                                linked={isConnectorHovered}
                                onSelect={() => setSelection(seatIndex)}
                            />
                            {seatIndex < data.seats.length - 1 && (
                                <button
                                    type="button"
                                    aria-label={`Select all ${data.title} seats`}
                                    className={cn(
                                        styles.seatConnector,
                                        isConnectorHovered &&
                                            styles.seatConnectorLinked,
                                        activeSelection === 'all' &&
                                            styles.seatConnectorSelected
                                    )}
                                    onClick={() => setSelection('all')}
                                    onMouseEnter={() =>
                                        setIsConnectorHovered(true)
                                    }
                                    onMouseLeave={() =>
                                        setIsConnectorHovered(false)
                                    }
                                />
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </>
    )
}
