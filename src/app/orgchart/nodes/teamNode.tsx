import PositionBubble from '../bubbles/positionBubble'
import TeamBubble from '../bubbles/teamBubble'
import PositionData from '../types/positionData'
import styles from './nodes.module.css'
import { Handle, Node, NodeProps, Position, useStore } from '@xyflow/react'
import { motion } from 'motion/react'

export type TeamNodeData = Node<{
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}>

const zoomSelector = (s: { transform: number[] }) => s.transform[2] >= 1.1

export default function TeamNode({
    data,
    targetPosition,
    sourcePosition,
}: NodeProps<TeamNodeData>) {
    const extraContent = useStore(zoomSelector)

    const TeamLeads = () => {
        return data.leads?.map((lead) => {
            return <PositionBubble key={lead.id} data={lead} />
        })
    }

    return (
        <div key={data.id} className={styles.container}>
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
                    maxHeight: `${extraContent ? '240' : '0'}px`,
                }}
                animate={{
                    maxHeight: `${extraContent ? '240' : '0'}px`,
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
