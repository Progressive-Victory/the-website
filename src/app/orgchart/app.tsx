import '../../../tailwind.config'
import styles from './app.module.css'
import PositionBubble from './bubbles/positionBubble'
import DepartmentNode, { DepartmentNodeData } from './nodes/departmentNode'
import PositionNode from './nodes/positionNode'
import TeamNode, { TeamNodeData } from './nodes/teamNode'
import OrgChartEdge from './orgchartEdge'
import Committee from './types/committee'
import PositionData from './types/positionData'
import dagre from '@dagrejs/dagre'
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
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import React, { useState, useCallback } from 'react'

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

const GetElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({ rankdir: direction, ranksep: 50, nodesep: 25 })
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

function CreatePositionNode({
    id,
    title,
    name,
    acting,
    redacted,
    leadership,
    committees,
}: {
    id: number
    title: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}) {
    return {
        id: id.toString(),
        type: 'pos',
        position: defaultPos,
        data: {
            id,
            title,
            name,
            acting,
            redacted,
            leadership,
            committees,
        },
    }
}

function CreateDepartmentNode({
    id,
    name,
    leads,
    members,
}: {
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}) {
    return {
        id: id.toString(),
        type: 'dep',
        position: defaultPos,
        data: {
            id,
            name,
            leads,
            members,
        },
    }
}

function CreateTeamNode({
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

function CreateEdge(id: string, source: number, target: number) {
    return {
        id,
        source: source.toString(),
        target: target.toString(),
        type: 'custom-edge',
    }
}

/* Changes to this do not hot refresh on save; must use F5*/
const initialNodes: Node[] = [
    CreatePositionNode({
        id: 0,
        title: 'Executive Director',
        name: 'Sam Dryzmala',
        leadership: 'Senior',
    }),
    CreatePositionNode({
        id: 1,
        title: 'Deputy Executive Director',
        name: 'Benjamin Gilbert-Lif',
        leadership: 'Senior',
    }),
    CreateDepartmentNode({
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
    }),
    CreateTeamNode({
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
    }),
    CreateTeamNode({
        id: 10,
        name: 'Events Team',
        desc: "The Events Team... I'm also not gonna copy all of that.",
        leads: [
            {
                id: 11,
                title: 'Events Team Lead',
                name: 'BrewMasterCraft',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            {
                id: 12,
                title: 'Events Team Lead',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            {
                id: 13,
                title: 'Events Team Deputy',
                name: 'EM',
            },
        ],
    }),
]

/* Changes to this do not hot refresh on save; must use F5*/
const initialEdges: Edge[] = [
    CreateEdge('e0', 0, 1),
    CreateEdge('e1', 1, 2),
    CreateEdge('e2', 2, 6),
    CreateEdge('e3', 2, 10),
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
    const [legendEnabled, toggleLegend] = useState(false)

    function LegendPanel() {
        return (
            <Panel position="top-left">
                {!legendEnabled ? null : (
                    <div className={styles.legend}>
                        <div className={styles.colorSampleContainer}>
                            <div className={styles.juniorColorSample}></div>
                            <p style={{ marginLeft: '0.5rem' }}>
                                {'JUNIOR LEADERSHIP'}
                            </p>
                        </div>
                        <div className={styles.colorSampleContainer}>
                            <div className={styles.seniorColorSample}></div>
                            <p style={{ marginLeft: '0.5rem' }}>
                                {'SENIOR LEADERSHIP'}
                            </p>
                        </div>
                        <PositionBubble
                            data={{
                                id: -1,
                                title: 'Position Name',
                                name: 'Holder Name',
                                leadership: 'Senior',
                                committees: [Committees[0]],
                            }}
                            mini={true}
                        />
                        <p style={{ marginTop: '0.5rem' }}>
                            {'SHAPES INDICATE TEAM/COMMITTEE GROUPING'}
                        </p>
                    </div>
                )}
                <button
                    className={styles.legendButton}
                    onClick={() => toggleLegend(!legendEnabled)}
                >
                    {legendEnabled ? 'HIDE LEGEND' : 'SHOW LEGEND'}
                </button>
            </Panel>
        )
    }

    const DetailPanel = ({
        name,
        desc,
        leads,
        members,
    }: {
        name?: string
        desc?: string
        leads?: PositionData[]
        members?: PositionData[]
    }) => {
        const MemberList = () => {
            if (leads && members) {
                return leads.concat(members).map(CreateMini)
            } else if (leads) {
                return leads.map(CreateMini)
            } else if (members) {
                return members.map(CreateMini)
            } else return null
            function CreateMini(position: PositionData) {
                return (
                    <PositionBubble
                        key={position.id}
                        data={position}
                        mini={true}
                    />
                )
            }
        }

        return (
            <Panel
                className={styles.detailPanel}
                style={{ display: `${name ? 'block' : 'none'}` }}
                position="center-right"
            >
                <button
                    className={styles.closeButton}
                    onClick={() => setCurrentDetails(<DetailPanel />)}
                >
                    {'< Close'}
                </button>
                <p className={styles.detailTitle}>{name}</p>
                {!desc ? null : (
                    <div className={styles.descriptionContainer}>
                        <p className={styles.description}>{desc}</p>
                    </div>
                )}
                {!leads && !members ? null : (
                    <div className={styles.memberList}>
                        <MemberList />
                    </div>
                )}
            </Panel>
        )
    }

    const [currentDetails, setCurrentDetails] = useState(<DetailPanel />)
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)
    /*const [horizontal, setHorizontal] = useState(false)*/

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

    /*const viewportRef = useCallback(
        (viewport: HTMLDivElement) => {
            if (!viewport) return
            const observer = new ResizeObserver(() => {
                if (
                    viewport.offsetWidth > viewport.offsetHeight &&
                    !horizontal
                ) {
                    updateLayout('TB')
                    setHorizontal(false)
                } else if (
                    viewport.offsetWidth <= viewport.offsetHeight &&
                    horizontal
                ) {
                    updateLayout('TB')
                    setHorizontal(false)
                }
            })
            observer.observe(viewport)
        },
        [updateLayout, horizontal]
    )*/

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        if (node.type == 'dep') {
            const typedNode = node as DepartmentNodeData
            setCurrentDetails(
                <DetailPanel
                    name={typedNode.data.name}
                    leads={typedNode.data.leads}
                    members={typedNode.data.members}
                />
            )
        } else if (node.type == 'tea') {
            const typedNode = node as TeamNodeData
            setCurrentDetails(
                <DetailPanel
                    name={typedNode.data.name}
                    desc={typedNode.data.desc}
                    leads={typedNode.data.leads}
                    members={typedNode.data.members}
                />
            )
        } else setCurrentDetails(<DetailPanel />)
    }

    return (
        <div className={styles.background} /*ref={viewportRef}*/>
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
                autoPanOnNodeFocus={true}
                maxZoom={1.2}
                minZoom={0.25}
            >
                <LegendPanel />
                {currentDetails}
                <Controls />
            </ReactFlow>
        </div>
    )
}
