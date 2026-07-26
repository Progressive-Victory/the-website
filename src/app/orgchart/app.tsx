import '../../../tailwind.config'
import styles from './app.module.css'
import { DepartmentNode, DepartmentNodeData } from './components/department'
import OrgChartEdge from './components/edge'
import {
    PositionData,
    PositionNode,
    PositionBubble,
} from './components/position'
import { TeamNode, TeamNodeData } from './components/team'
import { BuildGraphNodes, Committees } from './data/constructOrgGraph'
import { orgchartData } from './data/orgchartGraphData'
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

const { initialNodes, initialEdges } = BuildGraphNodes(orgchartData)
//console.log(initialNodes)
//testNewGraphBuilder(posHierarchy)
//const { initialNodes, initialEdges } = testNewGraphBuilder(posHierarchy)
//console.log(initialNodes)

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
                {/*!leads && members ? null
                Make something for the Moderation team
                    <div>
                        <ul>{ //names of moderation team members }</ul>
                    </div>
                */}
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
