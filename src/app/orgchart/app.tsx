/* Next task: refine and implement legend panel */
import React, { useState, useCallback } from 'react'
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
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import PositionNode from './nodes/positionNode'
import DepartmentNode, { DepartmentNodeData } from './nodes/departmentNode'
import TeamNode, { TeamNodeData } from './nodes/teamNode'
import OrgChartEdge from './orgchartEdge'
import '../../../tailwind.config'
import Committee from './types/committee'
import PositionData from './types/positionData'
import PositionBubble from './bubbles/positionBubble'

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


const testNodes: Node[] = [
    {
        id: 0,
        title: 'Executive Director',
        name: 'Sam Dryzmala',
        leadership: 'Senior'
    },
    {
        id: 1,
        title: 'Deputy Executive Director',
        name: 'Benjamin Gilbert-Lif',
        leadership: 'Senior',
    },
    {
        id: 2,
        title: 'Community Relations Director',
        name: 'Auntifa',
        leadership: 'Senior',
        department: "Community",
        team: null,
        committees: []
    },
    {
        id: 3,
        title: 'Community Mananger',
        name: 'Jenywlfersn',
        leadership: 'Junior',
        department: "Community",
        team: null,
        committees: [Committees[0], Committees[1]],
    },
    {
        id: 4,
        title: 'Community Manager',
        name: "?",
        leadership: 'Junior',
        department: "Community",
        team: null,
        committees: [Committees[0], Committees[1]],
    },
    {
        id: 5,
        title: 'Welcome Team Lead',
        name: 'Monarch',
        department: "Community",
        team: "Welcome",
        leadership: 'Junior',
        committees: [Committees[0]],
    },
    {
        id: 6,
        title: 'Welcome Team Lead',
        name: "?",
        leadership: 'Junior',
        department: "Community",
        team: "Welcome",
        committees: [Committees[0]],
    },

    {
        id: 7,
        name: "?",
        title: 'Welcome Team Deputy',
        leadership: "?",
        department: "Community",
        team: "Welcome",
        committees: []
    },
    {
        id: 8,
        title: 'Events Team Lead',
        name: 'BrewMasterCraft',
        leadership: 'Junior',
        department: "Community",
        team: "Events",
        committees: [Committees[0]],
    },
    {
        id: 9,
        title: 'Events Team Lead',
        name: "?",
        leadership: 'Junior',
        department: "Community",
        team: "Events",
        committees: [Committees[0]],
    },
    {
        id: 10,
        title: 'Events Team Deputy',
        name: "?",
        leadership: "?",
        department: "Community",
        team: "Events",
        name: 'EM',
    }
]


//GOAL - Figure out how to translate the nodes into the initialNodes that exist.

/*const departments = [
    {depName: "Community", teams: ["Welcome", "Events", "Moderation", "Writing"]}, 
    {depName: "Media", teams: ["Writing", "Audio-Video", "Design"]}, 
    {depName: "Operations", teams: ["Fundraising", "Documentation"]}, 
    {depName: "Infrastructure", teams: ["Documentation", "Research"]}, 
    {depName: "Organizing", teams: ["Recruitment", "Mobilization"]}, 
    {depName: "Technology", teams: ["Discord", "Database", "Website"]}
]*/

const departments = [
    {depName: "Community", teams: ["Welcome", "Events"]}
]

function GetNodes(){

    const initialTestNodes: Node[] = []
    const initialTestEdges: Edge[] = []

    let id = testNodes.length;

    const execDir = testNodes.find(e => e?.title === "Executive Director")
    const depExecDir = testNodes.find(e => e?.title === "Deputy Executive Director")

    initialTestNodes.push(CreatePositionNode(execDir))
    initialTestNodes.push(CreatePositionNode(depExecDir))

    let departmentId = 0
    let teamId = 0
    let edgeId = 0

    initialTestEdges.push(CreateEdge(`e${edgeId}`, 0, 1))
    edgeId++
    //initialTestEdges.push(CreateEdge(`e${edgeId}`, 0, 1))

    departments.forEach(dep => {
        const depLeads = testNodes.filter(d => ((d.department == dep.depName) && (!d.team)))
        id++
        departmentId = id
        initialTestNodes.push(CreateDepartmentNode({id: departmentId, name: dep.depName, leads: depLeads}))

        dep?.teams.forEach(team => {
            const teamLeads = testNodes.filter(t => (t.team === team))
            id++
            teamId = id

            initialTestNodes.push(CreateTeamNode({id: teamId, name: team, desc: "Description", leads: teamLeads}))
            //initial edges
            
            initialTestEdges.push(CreateEdge(`e${edgeId}`, departmentId, teamId))
            
            edgeId++
        })
    })

    console.log(initialTestNodes)
    console.log(initialTestEdges)

    return { initialTestNodes, initialTestEdges }
} 


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
            id: id,
            title: title,
            name: name,
            acting: acting,
            redacted: redacted,
            leadership: leadership,
            committees: committees,
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
            id: id,
            name: name,
            leads: leads,
            members: members,
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
            id: id,
            name: name,
            desc: desc,
            leads: leads,
            members: members,
        },
    }
}

function CreateEdge(id: string, source: number, target: number) {
    return {
        id: id,
        source: source.toString(),
        target: target.toString(),
        type: 'custom-edge',
    }
}

//GetNodes(initialTestNodes, initialTestEdges)
//GetNodes()

const { initialTestNodes, initialTestEdges } = GetNodes()

console.log("initialTestEdges")
console.log(initialTestEdges)


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


/*console.log("initialNodes")
console.log(initialNodes)*/

console.log("initialTestNodes")
console.log(initialTestNodes)


/*const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
    initialNodes,
    initialEdges
)*/
const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
    initialTestNodes,
    initialTestEdges
)

export default function OrgChartApp() {
    const [legendEnabled, toggleLegend] = useState(false)

    function LegendPanel() {
        return (
            <Panel position="top-left">
                {!legendEnabled ? null : (
                    <div className="mb-2 rounded-xl border-4 border-amber-300 bg-amber-50 p-2 text-xs font-bold text-black-pearl-dark">
                        <div className="mb-2 flex">
                            <div className="size-4 border-2 border-amber-300 bg-blue-400"></div>
                            <p className="ml-2">{'JUNIOR LEADERSHIP'}</p>
                        </div>
                        <div className="mb-2 flex">
                            <div className="size-4 border-2 border-amber-300 bg-red-600"></div>
                            <p className="ml-2">{'SENIOR LEADERSHIP'}</p>
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
                        <p className="mt-2">
                            {'SHAPES INDICATE TEAM/COMMITTEE GROUPING'}
                        </p>
                    </div>
                )}
                <button
                    className="rounded-xl border-4 border-amber-300 bg-amber-50 p-1 font-black text-black-pearl-dark"
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
                className={`${name ? null : 'hidden'} h-[96%] w-[320px] rounded-3xl border-4 border-amber-300 bg-amber-50 p-2 font-extrabold`}
                position="center-right"
            >
                <button
                    className="mb-1 rounded-xl bg-black-pearl-dark p-1 px-2 text-xl font-bold text-white"
                    onClick={() => setCurrentDetails(<DetailPanel />)}
                >
                    {'< Close'}
                </button>
                <p className="border-t-4 border-red-600 text-xl text-black-pearl-dark">
                    {name}
                </p>
                {!desc ? null : (
                    <div className="max-h-[30%] overflow-y-auto border-t-4 border-red-600">
                        <p className="py-1 text-sm font-semibold text-black-pearl-dark">
                            {desc}
                        </p>
                    </div>
                )}
                {!leads && !members ? null : (
                    <div className="flex flex-col items-center overflow-auto border-t-4 border-red-600 py-1">
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
        <div className="size-full bg-white" /*ref={viewportRef}*/>
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
