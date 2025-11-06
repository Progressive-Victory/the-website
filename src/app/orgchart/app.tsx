import React, { useCallback } from 'react'
import {
    type Node,
    type Edge,
    Position,
    ReactFlow,
    Controls,
    Panel,
    useNodesState,
    useEdgesState,
} from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import PositionNode from './nodes/positionNode'
import DepartmentNode from './nodes/departmentNode'
import TeamNode from './nodes/teamNode'
import OrgChartEdge from './orgchartEdge'
import '../../../tailwind.config'

/*
Create a new directed graph with 'const g = new dagre.graphlib.Graph()'
Set an object for the graph label with 'g.setGraph({})'
Default to assigning a new object as a label for each new edge 'g.setDefaultEdgeLabel(function() {return{}})'
Create the elements, using the inital nodes and initial edges table
dagre.layout
*/

/* Creates a new graph and sets its default edge label */
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const nWidth = 360
const nHeight = 360

const GetElements = (nodes: Node[], edges: Edge[], direction = 'ver') => {
    const isHorizontal = direction === 'hor'
    dagreGraph.setGraph({ rankdir: direction, ranksep: 0 })
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nWidth, height: nHeight })
    })
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })
    dagre.layout(dagreGraph)
    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        const newNode: Node = {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - nWidth / 2,
                y: nodeWithPosition.y - nHeight / 2,
            },
        }
        return newNode
    })
    return { nodes: newNodes, edges }
}

/* Array of all nodes */
const initialNodes: Node[] = [
    {
        id: '0',
        type: 'pos',
        data: {
            id: 0,
            title: 'Executive Director',
            name: 'Sam Dryzmala',
            leadership: 'Senior',
        },
        position: { x: 0, y: 0 },
    },
    {
        id: '1',
        type: 'pos',
        data: {
            id: 1,
            title: 'Deputy Executive Director',
            name: 'Benjamin Gilbert-Lif',
            leadership: 'Senior',
        },
        position: { x: 0, y: 0 },
    },
    {
        id: '2',
        type: 'dep',
        data: {
            id: 2,
            name: 'Engineering',
            leads: [
                {
                    id: 3,
                    title: 'Technical Director',
                    redacted: true,
                    leadership: 'Senior',
                },
                {
                    id: 4,
                    title: 'Deputy Technical Director',
                    name: 'Adrian',
                    leadership: 'Senior',
                },
                {
                    id: 5,
                    title: 'Deputy Techincal Director',
                    name: 'Joops',
                    leadership: 'Senior',
                },
            ],
        },
        position: { x: 0, y: 0 },
    },
    {
        id: '6',
        type: 'tea',
        data: {
            id: 6,
            name: 'Discord Eng. Team',
            desc: 'Manages the development of the Progressive Victory Discord bot.',
            leads: [
                {
                    id: 7,
                    title: 'Discord Eng. Team Lead',
                    name: 'Sh3llHound',
                },
                {
                    id: 8,
                    title: 'Discord Eng. Team Lead',
                },
                {
                    id: 9,
                    title: 'Discord Eng. Deputy',
                    name: 'Mafia',
                },
            ],
        },
        position: { x: 0, y: 0 },
    },
]

/* Array of all edges */
const initialEdges: Edge[] = [
    {
        id: 'e1',
        source: '0',
        target: '1',
        type: 'custom-edge',
    },
    {
        id: 'e2',
        source: '2',
        target: '6',
        type: 'custom-edge',
    },
]

const nodeTypes = {
    pos: PositionNode,
    dep: DepartmentNode,
    tea: TeamNode,
}

const edgeTypes = {
    'custom-edge': OrgChartEdge,
}

const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
    initialNodes,
    initialEdges
)

export default function OrgChartApp() {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    const onLayout = useCallback(
        (direction: string | undefined) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
                nodes,
                edges,
                direction
            )
            setNodes(layoutedNodes)
            setEdges(layoutedEdges)
        },
        [nodes, edges, setNodes, setEdges]
    )

    return (
        <div className="size-full bg-white">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
            >
                <Panel position="top-right">
                    <button
                        className="m-2 rounded-xl bg-black-pearl-dark p-2 font-bold text-white"
                        onClick={() => onLayout('ver')}
                    >
                        Vertical Layout
                    </button>
                    <button
                        className="m-2 rounded-xl bg-black-pearl-dark p-2 font-bold text-white"
                        onClick={() => onLayout('hor')}
                    >
                        Horizontal Layout
                    </button>
                </Panel>
                <Controls />
            </ReactFlow>
        </div>
    )
}
