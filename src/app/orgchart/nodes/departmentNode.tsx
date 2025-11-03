import { Handle, Node, NodeProps, Position, useStore } from '@xyflow/react'
import DepartmentBubble from '../bubbles/departmentBubble'
import PositionData from '../types/positionData'
import PositionBubble from '../bubbles/positionBubble'

export type DepartmentNodeData = Node<{
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}>

const zoomSelector = (s: { transform: number[] }) => s.transform[2] >= 1.2

export default function DepartmentNode({
    data,
}: NodeProps<DepartmentNodeData>) {
    const extraContent = useStore(zoomSelector)

    const DepartmentLeads = () => {
        return data.leads?.map(RenderLead)
        function RenderLead(lead: PositionData) {
            return <PositionBubble key={lead.id} data={lead} />
        }
    }

    return (
        <div key={data.id} className="flex flex-col items-center">
            <Handle
                type="target"
                position={Position.Top}
                className="border-amber-300 bg-amber-50 opacity-0"
            />
            <DepartmentBubble name={data.name}></DepartmentBubble>
            {extraContent ? <DepartmentLeads /> : null}
            <Handle
                type="source"
                position={Position.Bottom}
                className="border-amber-300 bg-amber-50 opacity-0"
            />
        </div>
    )
}
