import styles from './components.module.css'
import { PositionData, PositionBubble } from './position'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import { motion } from 'motion/react'
import { useState } from 'react'

export default interface TeamData {
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}

export type TeamNodeData = Node<{
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}>

export function TeamNode({
    data,
    targetPosition,
    sourcePosition,
}: NodeProps<TeamNodeData>) {
    const [contentEnabled, setContentEnabled] = useState(false)

    const TeamLeads = () => {
        return data.leads?.map((lead) => {
            return <PositionBubble key={lead.id} data={lead} />
        })
    }

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
            <TeamBubble name={data.name} />
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
                }}
            >
                <TeamLeads />
            </motion.div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

export default function TeamBubble({ name }: { name: string }) {
    return (
        <div className={styles.yellowBubble}>
            <p>{name.toUpperCase()}</p>
        </div>
    )
}

const defaultPos: XYPosition = { x: 0, y: 0 }

export function CreateTeamNode({
    id,
    name,
    desc,
    leads,
    members,
}: {
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}) {
    return {
        id: id.toString(),
        type: 'tea',
        position: defaultPos,
        data: {
            id,
            name,
            desc,
            leads,
            members,
        },
    }
}
