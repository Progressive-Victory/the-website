import '../../../tailwind.config'
import styles from './app.module.css'
import { BlankNode } from './components/blankNode'
import OrgChartEdge from './components/edge'
import { GroupNode } from './components/group'
import { Banner } from './components/position'
import {
    PositionNode,
    PositionData,
    PositionBubble,
} from './components/position'
import { orgchartData, orgchartEdges, Tags } from './data/orgchartGraphData'
import dagre from '@dagrejs/dagre'
import {
    type Node,
    type Edge,
    Position,
    ReactFlow,
    Controls,
    useNodesState,
    useEdgesState,
    Panel,
} from '@xyflow/react'
/* These work; they are just flagged as errors for some reason. */
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import React, { useState } from 'react'

/* A number of committees can be defined up to the number of icons. */

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const nWidth = 340
const nHeight = 280

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

const nodeTypes = {
    positionNode: PositionNode,
    groupNode: GroupNode,
    blankNode: BlankNode,
}

const edgeTypes = {
    'custom-edge': OrgChartEdge,
}

const { nodes: layoutedNodes, edges: layoutedEdges } = GetElements(
    orgchartData,
    orgchartEdges
)

export default function OrgChartApp() {
    const [legendEnabled, toggleLegend] = useState(false)

    const LegendPanel = () => {
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
                                banner: Banner.RED,
                                tags: [Tags[0], Tags[1]],
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
            let memberNumber = -1
            if (leads && members) {
                return leads.concat(members).map(CreateMini)
            } else if (leads) {
                return leads.map(CreateMini)
            } else if (members) {
                return members.map(CreateMini)
            } else return null
            function CreateMini(position: PositionData) {
                memberNumber++
                return (
                    <PositionBubble
                        key={memberNumber}
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

    const RefreshButton = () => {
        return (
            <Panel position="bottom-right">
                <button
                    className={styles.legendButton}
                    onClick={() => {
                        setNodes(layoutedNodes)
                        setEdges(layoutedEdges)
                    }}
                >
                    {'REFRESH'}
                </button>
            </Panel>
        )
    }

    const [currentDetails, setCurrentDetails] = useState(<DetailPanel />)
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        if (node.type == 'groupNode') {
            const castedNode = node as GroupNode
            setCurrentDetails(
                <DetailPanel
                    name={castedNode.data.name}
                    desc={castedNode.data.desc}
                    leads={castedNode.data.leads}
                    members={castedNode.data.members}
                />
            )
        } else setCurrentDetails(<DetailPanel />)
    }

    // Add back the legend panel
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
                maxZoom={1.0}
                minZoom={0.25}
            >
                <LegendPanel />
                {currentDetails}
                <Controls />
                <RefreshButton />
            </ReactFlow>
        </div>
    )
}
