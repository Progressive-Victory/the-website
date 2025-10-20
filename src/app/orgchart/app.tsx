import { ReactFlow, Controls } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import PositionNode from './nodes/positionNode'
import DepartmentNode from './nodes/departmentNode'
import TeamNode from './nodes/teamNode'
import OrgChartEdge from './orgchartEdge'
import '../../../tailwind.config'

const nodes = [
    {
        id: 'p1',
        type: 'positionNode',
        position: { x: 0, y: 0 },
        data: {
            title: 'Executive Director',
            name: 'Sam Dryzmala',
            leadership: 'Senior',
        },
    },
    {
        id: 'p2',
        type: 'positionNode',
        position: { x: 0, y: 150 },
        data: {
            title: 'Deputy Executive Director',
            name: 'Benjamin Gilbert-Lif',
            leadership: 'Senior',
        },
    },
    {
        id: 'd1',
        type: 'departmentNode',
        position: { x: 0, y: 300 },
        data: {
            name: 'Engineering',
            leads: [
                {
                    id: 'p5',
                    title: 'Technical Director',
                    redacted: true,
                    leadership: 'Senior',
                },
                {
                    id: 'p6',
                    title: 'Deputy Technical Director',
                    name: 'Adrian',
                    leadership: 'Senior',
                },
                {
                    id: 'p7',
                    title: 'Deputy Technical Director',
                    name: 'Joops',
                    leadership: 'Senior',
                },
            ],
        },
    },
    {
        id: 't1',
        type: 'teamNode',
        position: { x: 0, y: 800 },
        data: {
            name: 'Website Eng. Team',
            desc: 'Manages the weekly publication of the This Week at Progressive Victory newsletter.',
            leads: [],
        },
    },
]

const edges = [
    {
        id: 'p1-p2',
        source: 'p1',
        target: 'p2',
        type: 'custom-edge',
    },
    {
        id: 'p-2',
        source: 'p2',
        target: 'd1',
        type: 'custom-edge',
    },
]

const nodeTypes = {
    positionNode: PositionNode,
    departmentNode: DepartmentNode,
    teamNode: TeamNode,
}

const edgeTypes = {
    'custom-edge': OrgChartEdge,
}

export default function OrgChartApp() {
    return (
        <div className="size-full bg-white">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
            >
                <Controls />
            </ReactFlow>
        </div>
    )
}
