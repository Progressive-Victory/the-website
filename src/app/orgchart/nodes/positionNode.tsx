import PositionBubble from '../bubbles/positionBubble'
import Committee from '../types/committee'
import PositionData from '../types/positionData'
import styles from './nodes.module.css'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'

type PositionNodeData = Node<{
    id: number
    title: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}>

export default function PositionNode({
    data,
    targetPosition,
    sourcePosition,
}: NodeProps<PositionNodeData>) {
    const properties: PositionData = {
        id: data.id,
        title: data.title,
        name: data.name,
        acting: data.acting,
        redacted: data.redacted,
        leadership: data.leadership,
        committees: data.committees,
    }

    return (
        <div key={data.id} className={styles.container}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <PositionBubble data={properties} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}
