import styles from './components.module.css'
import { XYPosition, Node, NodeProps, Position, Handle } from '@xyflow/react'
import { motion } from 'motion/react'
import React, { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GroupNodeData = {
    id: number | string
    name: string
    bubble?: React.ReactNode
    customData?: unknown[]
}

type GroupNode = Node<GroupNodeData, 'groupNode'>

function GroupNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<GroupNode>) {
    return (
        data.bubble ?? (
            <DefaultGroupNode
                id={data.id.toString()}
                data={{
                    id: data.id,
                    name: data.name,
                    bubble: null,
                    customData: data.customData,
                }}
                type={'groupNode'}
                dragging={false}
                zIndex={0}
                selectable={false}
                deletable={false}
                selected={false}
                draggable={false}
                isConnectable={false}
                positionAbsoluteX={0}
                positionAbsoluteY={0}
                targetPosition={targetPosition}
                sourcePosition={sourcePosition}
            />
        )
    )
}

function DefaultGroupNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<GroupNode>) {
    const [contentEnabled, setContentEnabled] = useState(false)

    const handlePointerEnter = (e: React.PointerEvent) => {
        if (e.pointerType == 'mouse') {
            setContentEnabled(true)
        }
    }

    return (
        <div
            key={data.id}
            className={styles.nodeContainer}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={() => setContentEnabled(false)}
        >
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <DefaultGroupBubble name={data.name} />
            <motion.div
                className={styles.dropdownContainer}
                style={{
                    willChange: 'max-height',
                }}
                initial={{
                    maxHeight: `${contentEnabled ? '240' : '0'}px`,
                }}
                animate={{
                    maxHeight: `${contentEnabled ? '240' : '0'}px`,
                    transition: {
                        type: 'tween',
                        duration: 0.5,
                    },
                }}
            >
                {'Sample Content!'}
            </motion.div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

export function DefaultGroupBubble({
    name,
    children,
}: {
    name: string
    children?: React.ReactNode
}) {
    if (children == null) {
        return (
            <div className={styles.yellowBubble}>
                {<p>{name.toUpperCase()}</p>}
            </div>
        )
    } else return <div className={styles.yellowBubble}>{children}</div>
}

export function CreateGroupNode({
    id,
    name,
    position,
    bubble,
    data,
}: {
    id: number | string
    name: string
    position?: XYPosition
    bubble?: React.ReactNode
    data: unknown[]
}) {
    if (position == null) {
        return {
            id: id.toString(),
            position: { x: 0, y: 0 },
            data: {
                id,
                name,
                bubble,
                data,
            },
        }
    } else
        return {
            id: id.toString(),
            position,
            data: {
                id,
                name,
                bubble,
                data,
            },
        }
}
