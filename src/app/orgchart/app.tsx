import React, { useCallback, useState } from 'react'
import {
    type Node,
    type Edge,
    Position,
    ReactFlow,
    Controls,
    useNodesState,
    useEdgesState,
    XYPosition,
    Panel,
} from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import PositionNode from './nodes/positionNode'
import DepartmentNode, { DepartmentNodeData } from './nodes/departmentNode'
import TeamNode, { TeamNodeData } from './nodes/teamNode'
import OrgChartEdge from './orgchartEdge'
import '../../../tailwind.config'
import Committee from './types/committee'
import DetailPanel from './detailPanel'

/* A number of committees can be defined up to the number of icons. */
export const Committees: Committee[] = [
    {
        id: 101,
        name: 'Community Team',
        desc: 'The community management team...',
        icon: '/images/cir.png',
        alt: 'C',
    },
    {
        id: 102,
        name: 'Media Team',
        desc: 'The media team...',
        icon: '/images/tri.png',
        alt: 'M',
    },
    {
        id: 103,
        name: 'Engineering Committee',
        desc: "PV's engineering teams...",
        icon: '/images/sqr.png',
        alt: 'E',
    },
    {
        id: 104,
        name: 'State Organizing Committee',
        desc: 'The state organizing committee...',
        icon: '/images/dia.png',
        alt: 'S',
    },
]

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const nWidth = 360
const nHeight = 300
const defaultPos: XYPosition = { x: 0, y: 0 }

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

/* Changes to this do not hot refresh on save; must use F5*/
const initialNodes: Node[] = [
    {
        id: 'exec',
        type: 'pos',
        data: {
            id: 0,
            title: 'Executive Director',
            name: 'Sam Dryzmala',
            leadership: 'Senior',
        },
        position: defaultPos,
    },
    {
        id: 'depExec',
        type: 'pos',
        data: {
            id: 1,
            title: 'Deputy Executive Director',
            name: 'Benjamin Gilbert-Lif',
            leadership: 'Senior',
        },
        position: defaultPos,
    },
    {
        id: 'community',
        type: 'dep',
        position: defaultPos,
        data: {
            id: 2,
            name: 'Community Department',
            leads: [
                {
                    id: 3,
                    title: 'Community Relations Director',
                    name: 'Auntifa',
                    leadership: 'Senior',
                },
                {
                    id: 4,
                    title: 'Community Mananger',
                    name: 'Jenywlfersn',
                    leadership: 'Junior',
                    committees: [Committees[0], Committees[1]],
                },
                {
                    id: 5,
                    title: 'Community Manager',
                    leadership: 'Junior',
                    committees: [Committees[0], Committees[1]],
                },
            ],
        },
    },
    {
        id: 'welcome',
        type: 'tea',
        position: defaultPos,
        data: {
            id: 6,
            name: 'Welcome Team',
            desc: "Welcome team gurantees... I'm not gonna copy all of that.",
            leads: [
                {
                    id: 7,
                    title: 'Welcome Team Lead',
                    name: 'Monarch',
                    leadership: 'Junior',
                    committees: [Committees[0]],
                },
                {
                    id: 8,
                    title: 'Welcome Team Lead',
                    leadership: 'Junior',
                    committees: [Committees[0]],
                },
                {
                    id: 9,
                    title: 'Welcome Team Deputy',
                },
            ],
        },
    },
    {
        id: 'writing',
        type: 'tea',
        position: defaultPos,
        data: {
            id: 10,
            name: 'Writing Team',
            desc: 'The writing team...',
            leads: [
                {
                    id: 11,
                    title: 'Writing Team Lead',
                    name: 'Dynas',
                    leadership: 'Junior',
                    committees: [Committees[0], Committees[1]],
                },
                {
                    id: 12,
                    title: 'Writing Team Lead',
                    name: 'AJ',
                    leadership: 'Junior',
                    committees: [Committees[0], Committees[1]],
                },
                {
                    id: 13,
                    title: 'Writing Team Deputy',
                    name: 'Jam',
                },
            ],
        },
    },
    {
        id: 'this week',
        type: 'tea',
        position: defaultPos,
        data: {
            id: 14,
            name: 'This Week at PV Strike Team',
            desc: 'Manages the weekly publication of the This Week at Progressive Victory newsletter.',
        },
    },
    {
        id: 'media',
        type: 'dep',
        position: defaultPos,
        data: {
            id: 15,
            name: 'Media Department',
            leads: [
                {
                    id: 16,
                    title: 'Media Director',
                    name: 'Aussy',
                    leadership: 'Senior',
                },
                {
                    id: 17,
                    title: 'Deputy Media Director',
                    name: 'Leeloo',
                    leadership: 'Senior',
                },
                {
                    id: 18,
                    title: 'Deputy Media Director',
                    leadership: 'Senior',
                },
            ],
        },
    },
    {
        id: 'AV',
        type: 'tea',
        position: defaultPos,
        data: {
            id: 19,
            name: 'Audio-Video Team',
            desc: 'The Audio-Video team...',
            leads: [
                {
                    id: 20,
                    title: 'Audio-Video Team Lead',
                    name: 'Vezanmatics',
                    leadership: 'Junior',
                    committees: [Committees[1]],
                },
                {
                    id: 21,
                    title: 'Audio-Video Team Lead',
                    leadership: 'Junior',
                    committees: [Committees[1]],
                },
                {
                    id: 22,
                    title: 'Audio-Video Team Deputy',
                },
            ],
        },
    },
]

/* Changes to this do not hot refresh on save; must use F5*/
const initialEdges: Edge[] = [
    {
        id: 'e1',
        source: 'exec',
        target: 'depExec',
        type: 'custom-edge',
    },
    {
        id: 'e2',
        source: 'depExec',
        target: 'community',
        type: 'custom-edge',
    },
    {
        id: 'e3',
        source: 'depExec',
        target: 'media',
        type: 'custom-edge',
    },
    {
        id: 'e4',
        source: 'community',
        target: 'welcome',
        type: 'custom-edge',
    },
    {
        id: 'e5',
        source: 'community',
        target: 'writing',
        type: 'custom-edge',
    },
    {
        id: 'e6',
        source: 'writing',
        target: 'this week',
        type: 'custom-edge',
    },
    {
        id: 'e7',
        source: 'media',
        target: 'AV',
        type: 'custom-edge',
    },
    {
        id: 'e8',
        source: 'media',
        target: 'writing',
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
    const [detailPanel, setDetailPanel] = useState(<DetailPanel />)
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    const updateLayout = useCallback(
        (direction: string | undefined) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
                nodes,
                edges,
                direction
            )
            setNodes([...layoutedNodes])
            setEdges([...layoutedEdges])
        },
        [nodes, edges, setNodes, setEdges]
    )

    // Not using the event anyway
    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        if (node.type == 'dep') {
            const typedNode = node as DepartmentNodeData
            setDetailPanel(
                <DetailPanel
                    name={typedNode.data.name}
                    leads={typedNode.data.leads}
                    members={typedNode.data.members}
                />
            )
        } else if (node.type == 'tea') {
            const typedNode = node as TeamNodeData
            setDetailPanel(
                <DetailPanel
                    name={typedNode.data.name}
                    desc={typedNode.data.desc}
                    leads={typedNode.data.leads}
                    members={typedNode.data.members}
                />
            )
        } else setDetailPanel(<DetailPanel />)
    }

    return (
        <div className="size-full bg-white">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodesDraggable={false}
                nodesConnectable={false}
            >
                {/* A couple of buttons until we have updates based on viewport resizing*/}
                <Panel position="top-left">
                    <button
                        className="m-2 rounded-lg bg-black-pearl-light p-2 font-bold text-white"
                        onClick={() => updateLayout('hor')}
                    >
                        Horizontal
                    </button>
                    <button
                        className="m-2 rounded-lg bg-black-pearl-light p-2 font-bold text-white"
                        onClick={() => updateLayout('ver')}
                    >
                        Vertical
                    </button>
                </Panel>
                {detailPanel}
                <Controls />
            </ReactFlow>
        </div>
    )
}
