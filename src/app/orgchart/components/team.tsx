import styles from './components.module.css'
import { PositionData, PositionBubble } from './position'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import { motion } from 'motion/react'
import { useState, ReactNode } from 'react'

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
            <TeamBubble
                name={data.name}
                members={data.members}
                contentEnabled={contentEnabled}
            />
            <MotionDiv contentEnabled={contentEnabled} maxHeight={240}>
                <TeamLeads />
            </MotionDiv>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

export default function TeamBubble({
    name,
    members,
    contentEnabled,
}: {
    name: string
    members?: PositionData[]
    contentEnabled: boolean
}) {
    return (
        <div className={styles.yellowBubble}>
            <p>{name.toUpperCase()}</p>
            {members === null ? (
                <div></div>
            ) : (
                <MotionDiv contentEnabled={contentEnabled} maxHeight={260}>
                    <ul className={styles.modList}>
                        {members?.map((member) => (
                            <li key={member.id}>
                                <em>{member.name}</em>
                            </li>
                        ))}
                    </ul>
                </MotionDiv>
            )}
        </div>
    )
}

function MotionDiv({
    contentEnabled,
    maxHeight,
    children,
}: {
    contentEnabled: boolean
    maxHeight: Number
    children: ReactNode
}) {
    //
    return (
        <motion.div
            className={styles.dropdownContainer}
            style={{
                willChange: 'max-height',
            }}
            initial={{
                maxHeight: `${contentEnabled ? `${maxHeight}` : '0'}px`,
            }}
            animate={{
                maxHeight: `${contentEnabled ? `${maxHeight}` : '0'}px`,
            }}
        >
            {children}
        </motion.div>
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
