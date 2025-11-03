import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import PositionData from '../types/positionData'
import PositionBubble from '../bubbles/positionBubble'

type PositionNodeData = Node<{
    id: number
    title?: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
}>

export default function PositionNode({ data }: NodeProps<PositionNodeData>) {
    const properties: PositionData = {
        id: data.id,
        title: data.title,
        name: data.name,
        acting: data.acting,
        redacted: data.redacted,
        leadership: data.leadership,
    }

    return (
        <div key={data.id} className="flex flex-col items-center">
            <Handle
                type="target"
                position={Position.Top}
                className="border-amber-300 bg-black-pearl-dark opacity-0"
            />
            <PositionBubble data={properties} />
            <Handle
                type="source"
                position={Position.Bottom}
                className="border-amber-300 bg-black-pearl-dark opacity-0"
            />
        </div>
    )
}
