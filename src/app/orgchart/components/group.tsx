import styles from './components.module.css'
import { PositionBubble, PositionData } from './position'
import { Tag, Tags } from './tag'
import { XYPosition, Node, NodeProps, Position, Handle } from '@xyflow/react'
import { motion } from 'motion/react'
import React, { useRef, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GroupData = {
    id: string | number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
    tags?: Tag[]
}

export type GroupNode = Node<GroupData, 'groupNode'>

const GroupLeads = ({ data }: { data: GroupData }) => {
    let leadNumber = -1
    return data.leads?.map(RenderLead)
    function RenderLead(lead: PositionData) {
        leadNumber++
        return <PositionBubble key={leadNumber} data={lead} />
    }
}

export function GroupNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<GroupNode>) {
    const [leadsHeight, setLeadsHeight] = useState<number>(0)

    return (
        <div
            className={styles.nodeContainer}
            onPointerEnter={(e) => {
                if (e.pointerType == 'mouse') {
                    setLeadsHeight(192)
                }
            }}
            onPointerLeave={() => setLeadsHeight(0)}
        >
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.handle}
                style={{ opacity: 0 }}
            />
            <GroupBubble data={data} />
            <motion.div
                className={styles.dropdown}
                animate={{
                    maxHeight: `${leadsHeight}px`,
                }}
                transition={{
                    type: false,
                }}
            >
                <GroupLeads data={data} />
            </motion.div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.handle}
                style={{ opacity: 0 }}
            />
        </div>
    )
}

export function GroupBubble({ data }: { data: GroupData }) {
    const nameContainer = useRef<HTMLDivElement>(null)

    return (
        <div className={styles.yellowBubble}>
            <div className={styles.groupNameContainer} ref={nameContainer}>
                <Nameplate data={data} />
            </div>
            {data.tags ? <Tags data={data} /> : null}
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
            id: id.toString,
            name,
            desc,
            leads,
            members,
            tags,
        },
    }
}

const Nameplate = ({ data }: { data: GroupData }) => {
    return (
        <motion.div
            initial={{
                translateX: 0,
            }}
        >
            {data.name.toUpperCase()}
        </motion.div>
    )
}
