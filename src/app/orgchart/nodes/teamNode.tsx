import { Handle, Node, NodeProps, Position, useStore } from '@xyflow/react'
import TeamBubble from '../bubbles/teamBubble'
import PositionData from '../types/positionData'
import PositionBubble from '../bubbles/positionBubble'

export type TeamNodeData = Node<{
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}>

const zoomSelector = (s: { transform: number[] }) => s.transform[2] >= 1.2

export default function TeamNode({ data }: NodeProps<TeamNodeData>) {
    const extraContent = useStore(zoomSelector)

    const TeamLeads = () => {
        return data.leads?.map((lead) => {
            return <PositionBubble key={lead.id} data={lead} />
        })
    }

    return (
        <div key={data.id} className="flex w-[360px] flex-col items-center">
            <Handle
                type="target"
                position={Position.Top}
                className="border-amber-300 bg-amber-50 opacity-0"
            />
            <TeamBubble name={data.name} />
            {extraContent ? <TeamLeads /> : null}
            <Handle
                type="source"
                position={Position.Bottom}
                className="border-amber-300 bg-amber-50 opacity-0"
            />
        </div>
    )
}
