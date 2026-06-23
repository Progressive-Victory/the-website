import { PositionBubble, PositionData } from '../components/newPosition'
import styles from './components.module.css'
import Tag from './tag'
import { XYPosition, Node, NodeProps, Position, Handle } from '@xyflow/react'
import { motion } from 'motion/react'
import React, { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GroupData = {
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
    tags?: Tag[]
}

export type GroupNode = Node<GroupData, 'groupNode'>

export function GroupNode({
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

    const GroupLeads = () => {
        let leadNumber = -1
        return data.leads?.map(RenderLead)
        function RenderLead(lead: PositionData) {
            leadNumber++
            return <PositionBubble key={leadNumber} data={lead} />
        }
    }

    return (
        <div
            className={styles.nodeContainer}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={() => setContentEnabled(false)}
        >
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <GroupBubble data={data} />
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
                <GroupLeads />
            </motion.div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

export function GroupBubble({ data }: { data: GroupData }) {
    const Tags = () => {
        return (
            <div className={styles.tagContainer}>
                {data.tags?.map((tag) => {
                    return (
                        <div
                            key={tag.name}
                            className={styles.tag}
                            title={tag.tooltip}
                        >
                            {tag.graphic}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={styles.yellowBubble}>
            <p
                style={{
                    gridColumn: `${data.tags ? 'span 11 / span 11' : 'span 12 / span 12'}`,
                }}
            >
                {data.name.toUpperCase()}
            </p>
            {data.tags ? <Tags /> : null}
        </div>
    )
}

export function CreateGroupNode({
    id,
    position = { x: 0, y: 0 },
    name,
    desc,
    leads,
    members,
    tags,
}: {
    id: number | string
    position?: XYPosition
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
    tags?: Tag[]
}) {
    return {
        id: id.toString(),
        type: 'groupNode',
        position,
        data: {
            name,
            desc,
            leads,
            members,
            tags,
        },
    }
}
