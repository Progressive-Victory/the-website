'use client'

import {
    ChartNode,
    MultiSeatNode,
    PositionGroup,
    RosterNode,
    type ChartFlowNode,
} from './components'
import { buildPositionNodes, initialEdges } from './data'
import styles from './page.module.css'
import { SidebarHeaderButton } from '@/components/common/navigation_stack/sidebar/Sidebar'
import Panel from '@/components/common/panel/Panel'
import { usePositionQueries } from '@/queries'
import { cn } from '@/util'
import { useQuery } from '@tanstack/react-query'
import {
    Background,
    ConnectionLineType,
    ConnectionMode,
    Controls,
    ReactFlow,
    useEdgesState,
    useNodesState,
    addEdge,
    type Connection,
    type Edge,
    type NodeChange,
} from '@xyflow/react'
/* These work; they are just flagged as errors for some reason. */
import '@xyflow/react/dist/base.css'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'
import { FaRegPenToSquare } from 'react-icons/fa6'

const nodeTypes = {
    chartNode: ChartNode,
    multiSeatNode: MultiSeatNode,
    rosterNode: RosterNode,
    positionGroup: PositionGroup,
}
const defaultEdgeOptions = { type: 'step' }

export default function Page() {
    const positionQueries = usePositionQueries()
    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })
    const [nodes, setNodes, onNodesChange] = useNodesState<ChartFlowNode>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
    const [isEditing, setIsEditing] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const positions = positionHierarchy.data?.positions
    const users = positionHierarchy.data?.users

    useEffect(() => {
        if (!positions || !users) return
        setNodes(buildPositionNodes(positions, users))
    }, [positions, setNodes, users])

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((currentEdges) => addEdge(connection, currentEdges))
            setIsDirty(true)
        },
        [setEdges]
    )

    const handleNodesChange = useCallback(
        (changes: NodeChange<ChartFlowNode>[]) => {
            if (changes.some((change) => change.type !== 'select'))
                setIsDirty(true)
            onNodesChange(changes)
        },
        [onNodesChange]
    )

    const isValidConnection = useCallback(
        (connection: Connection | Edge) =>
            connection.source !== connection.target,
        []
    )

    const handleEdit = () => setIsEditing(true)

    const handleSave = () => {
        setIsEditing(false)
        setIsDirty(false)
    }

    const handleDiscard = () => {
        if (positions && users) setNodes(buildPositionNodes(positions, users))
        setEdges(initialEdges)
        setIsEditing(false)
        setIsDirty(false)
    }

    return (
        <Panel
            includeHeader
            label="Chart"
            headerRight={
                <div className={styles.headerActions}>
                    <SidebarHeaderButton
                        icon={<FaRegPenToSquare size={20} />}
                        label="Create Position"
                    />
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!isDirty}
                                className={styles.button}
                            >
                                <FaSave /> Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className={cn(
                                    styles.button,
                                    styles.discardButton
                                )}
                            >
                                <FaTrashAlt /> Discard Changes
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className={styles.button}
                        >
                            <FaEdit /> Edit
                        </button>
                    )}
                </div>
            }
        >
            <div className={styles.flowContainer}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    isValidConnection={isValidConnection}
                    nodesDraggable={isEditing}
                    nodesConnectable={isEditing}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineType={ConnectionLineType.Step}
                    connectionMode={ConnectionMode.Loose}
                    zIndexMode="auto"
                    proOptions={{ hideAttribution: true }}
                    panOnScroll
                    fitView
                >
                    <Background />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>
        </Panel>
    )
}
