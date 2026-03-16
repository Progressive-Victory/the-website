import '../../../tailwind.config'
import styles from './app.module.css'
import Committee from './components/committee'
import { DepartmentNode, DepartmentNodeData } from './components/department'
import OrgChartEdge from './components/edge'
import {
    PositionData,
    PositionNode,
    PositionBubble,
} from './components/position'
import { TeamNode, TeamNodeData } from './components/team'
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
/* These work; they are just flagged as errors for some reason. */
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
    dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 25 })
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
                title: 'Community Manager',
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
    CreateDepartmentNode({
        id: 6,
        name: 'Media Department',
        leads: [
            {
                id: 7,
                title: 'Media Director',
                name: 'Aussy',
                leadership: 'Senior',
            },
            {
                id: 8,
                title: 'Deputy Media Director',
                name: 'Leeloo',
                leadership: 'Senior',
            },
            {
                id: 9,
                title: 'Deputy Media Director',
                leadership: 'Senior',
            },
        ],
    }),
    CreateTeamNode({
        id: 26,
        name: 'Welcome Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 27,
                title: 'Welcome Team Lead',
                name: 'Monarch',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            {
                id: 28,
                title: 'Welcome Team Lead',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            { id: 29, title: 'Welcome Team Deputy' },
        ],
    }),
    CreateTeamNode({
        id: 30,
        name: 'Events Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 31,
                title: 'Events Team Lead',
                name: 'BrewMasterCraft',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            {
                id: 32,
                title: 'Events Team Lead',
                leadership: 'Junior',
                committees: [Committees[0]],
            },
            { id: 33, title: 'Events Team Deputy', name: 'Em' },
        ],
    }),
    CreateTeamNode({
        id: 34,
        name: 'Moderation Team',
        desc: 'Yada yada yada',
        members: [
            { id: 35, name: 'Clementine' },
            { id: 36, name: 'Finnegan' },
            { id: 37, name: 'Jaxonmaxx' },
            { id: 38, name: 'Natalie' },
            { id: 39, name: 'Noelle' },
            { id: 40, name: 'Onbi' },
            { id: 41, name: 'Starry' },
            { id: 42, name: 'TheSunKey' },
            { id: 43, name: 'Victoria' },
        ],
    }),
    CreateTeamNode({
        id: 44,
        name: 'Writing Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 45,
                title: 'Writing Team Lead',
                name: 'Dynas',
                leadership: 'Junior',
                committees: [Committees[0], Committees[1]],
            },
            {
                id: 46,
                title: 'Writing Team Lead',
                name: 'AJ',
                leadership: 'Junior',
                committees: [Committees[0], Committees[1]],
            },
            {
                id: 47,
                title: 'Writing Team Deputy',
                name: 'Jam',
            },
        ],
    }),
    CreateTeamNode({
        id: 48,
        name: 'This Week at PV Strike Team',
        desc: 'Manages the weekly publication of the This Week at Progressive Victory newsletter.',
    }),
    CreateTeamNode({
        id: 49,
        name: 'Audio-Video Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 50,
                title: 'Audio-Video Team Lead',
                name: 'Vezanmatics',
                leadership: 'Junior',
                committees: [Committees[1]],
            },
            {
                id: 51,
                title: 'Audio-Video Team Lead',
                leadership: 'Junior',
                committees: [Committees[1]],
            },
            {
                id: 52,
                title: 'Audio-Video Team Deputy',
            },
        ],
    }),
    CreateTeamNode({
        id: 53,
        name: 'Design Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 54,
                title: 'Design Team Lead',
                leadership: 'Junior',
                committees: [Committees[1]],
            },
            {
                id: 55,
                title: 'Design Team Lead',
                leadership: 'Junior',
                committees: [Committees[1]],
            },
            {
                id: 56,
                title: 'Design Team Deputy',
            },
        ],
    }),
]

/* Changes to this do not hot refresh on save; must use F5*/
const initialEdges: Edge[] = [
    CreateEdge('0e1', 0, 1),
    CreateEdge('1e2', 1, 2),
    CreateEdge('1e6', 1, 6),
    CreateEdge('2e26', 2, 26),
    CreateEdge('2e30', 2, 30),
    CreateEdge('2e34', 2, 34),
    CreateEdge('2e44', 2, 44),
    CreateEdge('6e44', 6, 44),
    CreateEdge('44e48', 44, 48),
    CreateEdge('6e49', 6, 49),
    CreateEdge('6e53', 6, 53),
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
