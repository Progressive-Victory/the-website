import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import PositionData from '../types/positionData'
import PositionBubble from '../bubbles/positionBubble'
import Committee from '../types/committee'

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
        <div
            key={data.id}
            className="flex flex-col items-center justify-center"
        >
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className="border-amber-300 bg-amber-50 opacity-0"
            />
            <PositionBubble data={properties} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className="border-amber-300 bg-black-pearl-dark opacity-0"
            />
        </div>
    )
}
