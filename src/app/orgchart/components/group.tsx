import { PositionBubble, PositionData } from '../components/newPosition'
import styles from './components.module.css'
import Tag from './tag'
import { XYPosition, Node, NodeProps, Position, Handle } from '@xyflow/react'
import { motion } from 'motion/react'
import React, { useCallback, useRef, useState } from 'react'

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
    const GroupLeads = () => {
        let leadNumber = -1
        return data.leads?.map(RenderLead)
        function RenderLead(lead: PositionData) {
            leadNumber++
            return <PositionBubble key={leadNumber} data={lead} />
        }
    }

    return (
        <div className={styles.newNodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <GroupBubble data={data} />
            <div className={styles.newDropdown}>
                <GroupLeads />
            </div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

export function GroupBubble({ data }: { data: GroupData }) {
    const nameContainer = useRef<HTMLDivElement>(null)
    const [textboxWidth, setBoxWidth] = useState<number>(310)

    const Nameplate = useCallback(() => {
        return (
            <motion.div
                initial={{
                    translateX: 0,
                }}
                animate={{
                    translateX: [
                        0,
                        `min(calc(-100% + ${textboxWidth}px), 0px)`,
                    ],
                    transition: {
                        delay: 0.2,
                        times: [0.2, 0.8],
                        duration: 10,
                        repeat: Infinity,
                    },
                }}
                onAnimationStart={() => {
                    setBoxWidth(
                        nameContainer.current
                            ? nameContainer.current.offsetWidth
                            : 310
                    )
                }}
            >
                {data.name.toUpperCase()}
            </motion.div>
        )
    }, [data, textboxWidth])

    const Tags = useCallback(() => {
        if (!data.tags) return
        const pairs: Tag[][] = []
        data.tags.forEach((tag: Tag, index: number) => {
            if (index % 2 == 0) {
                pairs.push([tag])
            } else pairs[Math.floor(index / 2)][1] = tag
        })
        return (
            <div className={styles.tags}>
                {pairs.map((pair) => {
                    return (
                        <div className={styles.tagContainer} key={pair[0].name}>
                            {pair.map((tag) => {
                                return (
                                    <div
                                        key={tag.name}
                                        className={styles.tag}
                                        title={tag.tooltip ?? tag.name}
                                    >
                                        {tag.graphic}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        )
    }, [data])

    return (
        <div className={styles.yellowBubble}>
            <div className={styles.groupNameContainer} ref={nameContainer}>
                <Nameplate />
            </div>
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
