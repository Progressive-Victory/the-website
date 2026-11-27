'use client'

import {
    type Position,
    type Line,
    type HandleSide,
    type UserProfile,
    type BranchPoint,
} from '../api/domain/chart.types'
import {
    lineEndpoints,
    isMovablePoint,
    resolveLinePoints,
} from '../api/domain/lineGraph'
import styles from '../page.module.css'
import {
    connectionRadius,
    GroupResizeContext,
    nodeTypes,
    TitleHeightContext,
} from './ChartCanvasNodes'
import { ChartControls, type ChartControlsProps } from './ChartControls'
import { ChartLoading } from './ChartLoading'
import { GroupDragContext } from './GroupDragContext'
import { HelperLinesOverlay } from './HelperLinesOverlay'
import {
    LineEditingContext,
    type DirectionChevronMode,
    type LinePointCoordinates,
} from './LineEditingContext'
import { PositionEdge } from './PositionEdge'
import type { ChartClipboard } from './chartClipboard'
import {
    linePointNodes,
    linePointNodeType,
    linePointRadius,
} from './linePointNodes'
import { canConnectPositions } from './positions.connections'
import { findNewPosition, snapNodeCenters } from './positions.placement'
import { positionsToGraph } from './positionsToGraph'
import type { FlowAnchor } from './tooltip/ChartTooltip'
import { useChartAlignment } from './useChartAlignment'
import { useChartClipboard } from './useChartClipboard'
import { useChartEdges } from './useChartEdges'
import { useChartSelection } from './useChartSelection'
import {
    groupAtPoint,
    pointGroupChanges,
    regroupTarget,
    useGroupDrag,
} from './useGroupDrag'
import { useGroupPointCarry } from './useGroupPointCarry'
import {
    Background,
    ConnectionMode,
    ConnectionLineType,
    ReactFlow,
    applyNodeChanges,
    type Node,
    type OnNodesChange,
    type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import deepEqual from 'deep-equal'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useImperativeHandle,
    type ReactNode,
    type Ref,
} from 'react'

const edgeTypes = { basic: PositionEdge }
const emptyLines: Line[] = []
const emptyBranchPoints: BranchPoint[] = []
const snapGrid: [number, number] = [5, 5]
const fitViewOptions = { padding: 0.15, minZoom: 0.05 }

export interface ChartCanvasHandle {
    getNewPositionCoordinates: () => { x: number; y: number }
    getNewLinePointCoordinates: (lineId: string) => { x: number; y: number }
    groupAt: (coordinates: { x: number; y: number }) => number | undefined
}

const groupIdAt = (nodes: Node[], coordinates: { x: number; y: number }) => {
    const id = groupAtPoint(nodes, coordinates)
    return id === undefined ? undefined : Number(id)
}

interface ChartCanvasProps extends ChartControlsProps {
    onMoveLinePoints?: (coordinates: LinePointCoordinates) => void
    onPasteSelection?: (
        clipboard: ChartClipboard,
        at: { x: number; y: number }
    ) => ChartClipboard
    onCutSelection?: (ids: number[]) => void
    showHitboxes?: boolean
    directionChevrons?: DirectionChevronMode
    onSelectPoint?: (lineId: string, pointId: string) => void
    onRemovePoint?: (
        lineId: string,
        pointId: string,
        targetPointId: string
    ) => void
    onBranch?: (
        lineId: string,
        pointId: string,
        targetId: number,
        handle: HandleSide
    ) => void
    onMergeBranch?: (
        lineId: string,
        pointId: string,
        targetPointId: string
    ) => void
    onPointCoordinates?: (coordinates: LinePointCoordinates) => void
    pointCoordinates?: LinePointCoordinates
    onGroupBoundsChange?: (
        bounds: Map<number, NonNullable<Position['groupBounds']>>
    ) => void
    controlsRef?: Ref<ChartCanvasHandle>
    positions: Position[]
    lines?: Line[]
    branchPoints?: BranchPoint[]
    onChangeBranchPoint?: (point: BranchPoint) => void
    selectedLineId?: string
    selectedPointId?: string
    onSelectLine?: (id: string | null) => void
    onChangeLine?: (line: Line) => void
    users?: UserProfile[]
    selectedPositionId?: number
    onSelectPosition: (position: Position | null) => void
    onCoordinatesChange?: (
        id: number,
        coordinates: { x: number; y: number }
    ) => void
    onRegroup?: (
        id: number,
        parentGroupId: number | undefined,
        coordinates: { x: number; y: number }
    ) => void
    onPointGroupsChange?: (groups: Record<string, number | undefined>) => void
    onConnectPositions?: (
        sourceId: number,
        targetId: number,
        handles?: { sourceHandle: HandleSide; targetHandle: HandleSide }
    ) => void
    renderTooltip?: (
        positionId: number,
        controls: { duplicate: () => void }
    ) => ReactNode
    renderLineTooltip?: (lineId: string, at: FlowAnchor) => ReactNode
    renderPointTooltip?: (
        lineId: string,
        pointId: string,
        at: FlowAnchor
    ) => ReactNode
    placingPointLineId?: string | null
    onPointPlaced?: () => void
    drawingBranchPointId?: string | null
    onBranchDrawn?: (completed: boolean) => void
    isLoading: boolean
    error: string | null
}

export function ChartCanvas({
    onMoveLinePoints,
    onPasteSelection,
    onCutSelection,
    showHitboxes = true,
    directionChevrons = 'all',
    onSelectPoint,
    onRemovePoint,
    controlsRef,
    positions,
    lines = emptyLines,
    branchPoints = emptyBranchPoints,
    onChangeBranchPoint,
    selectedLineId,
    selectedPointId,
    onSelectLine,
    onChangeLine,
    onPointCoordinates,
    pointCoordinates,
    onBranch,
    onMergeBranch,
    users,
    selectedPositionId,
    onSelectPosition,
    onCoordinatesChange,
    onRegroup,
    onPointGroupsChange,
    onGroupBoundsChange,
    onConnectPositions,
    renderTooltip,
    renderLineTooltip,
    renderPointTooltip,
    placingPointLineId,
    onPointPlaced,
    drawingBranchPointId,
    onBranchDrawn,
    isLoading,
    error,
    editControls,
}: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mousePosition = useRef<{ x: number; y: number } | null>(null)
    const [flowReady, setFlowReady] = useState(false)
    const {
        guides: alignmentGuides,
        alignDuringDrag,
        finishNodeChanges,
        prepareDraggedNodes,
        clear: clearAlignment,
    } = useChartAlignment()
    const groupDrag = useGroupDrag(positions, clearAlignment)
    const groupPointCarry = useGroupPointCarry()
    const nameOf = useCallback(
        (id: string) =>
            positions.find((position) => String(position.id) === id)?.name ??
            'group',
        [positions]
    )
    const flowRef = useRef<Pick<
        ReactFlowInstance,
        'screenToFlowPosition' | 'getNodes' | 'getInternalNode' | 'fitView'
    > | null>(null)
    const fittedAfterLoad = useRef(false)
    useEffect(() => {
        if (isLoading || !flowReady || fittedAfterLoad.current) return
        fittedAfterLoad.current = true
        void flowRef.current?.fitView(fitViewOptions)
    }, [isLoading, flowReady])
    useImperativeHandle(controlsRef, () => ({
        getNewLinePointCoordinates: (lineId) => {
            const line = lines.find(({ id }) => id === lineId)
            const flow = flowRef.current
            if (!line || !flow)
                throw new Error('The line is not ready to add a point.')
            const { source, target } = lineEndpoints(line)
            const endpointCoordinates = (endpoint: typeof source) => {
                if (endpoint.kind === 'branchpoint') {
                    const point = branchPoints.find(
                        ({ id }) => id === endpoint.id
                    )
                    if (!point) throw new Error('The branchpoint is missing.')
                    return point.coordinates
                }
                const internal = flow.getInternalNode(
                    String(endpoint.positionId)
                )
                if (!internal)
                    throw new Error('The line endpoint is not measured yet.')
                const handles = internal.internals.handleBounds
                const handle = [
                    ...(handles?.source ?? []),
                    ...(handles?.target ?? []),
                ].find(({ id }) => id === endpoint.handle)
                if (!handle)
                    throw new Error('The line handle is not measured yet.')
                return {
                    x:
                        internal.internals.positionAbsolute.x +
                        handle.x +
                        handle.width / 2,
                    y:
                        internal.internals.positionAbsolute.y +
                        handle.y +
                        handle.height / 2,
                }
            }
            const last = resolveLinePoints(line, branchPoints).points.at(-2)
            const before =
                last && isMovablePoint(last)
                    ? last.coordinates
                    : endpointCoordinates(source)
            const after = endpointCoordinates(target)
            return { x: (before.x + after.x) / 2, y: (before.y + after.y) / 2 }
        },
        getNewPositionCoordinates: () => {
            const flow = flowRef.current
            const bounds = containerRef.current?.getBoundingClientRect()
            if (!flow || !bounds)
                throw new Error('The chart is not ready to create a position.')
            const center = flow.screenToFlowPosition(
                {
                    x: bounds.left + bounds.width / 2,
                    y: bounds.top + bounds.height / 2,
                },
                { snapToGrid: false }
            )
            return findNewPosition(
                center,
                flow
                    .getNodes()
                    .filter((node) => node.type !== linePointNodeType)
                    .map((node) => {
                        const internal = flow.getInternalNode(node.id)
                        return {
                            ...(internal?.internals.positionAbsolute ??
                                node.position),
                            width:
                                node.measured?.width ??
                                node.width ??
                                Number(node.style?.width ?? 240),
                            height:
                                node.measured?.height ??
                                node.height ??
                                Number(node.style?.height ?? 88),
                        }
                    })
            )
        },
        groupAt: (coordinates) =>
            groupIdAt(flowRef.current?.getNodes() ?? [], coordinates),
    }))
    const [titleHeights, setTitleHeights] = useState<Record<string, number>>({})
    const reportTitleHeight = useCallback((id: string, height: number) => {
        if (height <= 0) return
        setTitleHeights((previous) =>
            previous[id] === height ? previous : { ...previous, [id]: height }
        )
    }, [])
    const graph = useMemo(
        () =>
            positionsToGraph(
                positions,
                users,
                titleHeights,
                lines,
                branchPoints
            ),
        [positions, users, titleHeights, lines, branchPoints]
    )
    const layoutKey = useMemo(
        () =>
            JSON.stringify({
                editing: Boolean(editControls?.isEditing),
                nodes: graph.nodes.map(({ id, parentId, position, type }) => ({
                    id,
                    parentId,
                    position,
                    type,
                })),
            }),
        [graph.nodes, editControls?.isEditing]
    )
    const [nodeState, setNodeState] = useState<{
        layoutKey: string
        nodes: Record<
            string,
            {
                node: Node
            }
        >
    }>({ layoutKey, nodes: {} })
    useLayoutEffect(() => {
        if (!editControls?.isEditing) {
            setNodeState({ layoutKey, nodes: {} })
            clearAlignment()
        }
    }, [editControls?.isEditing, layoutKey, clearAlignment])
    const {
        selectedEdges,
        onEdgesChange,
        selectNode,
        selectPastedNodes,
        clearNodeSelection,
        clearSelectedEdges,
        selectEdge,
        recordNodeSelection,
        isNodeSelected,
    } = useChartSelection(selectedPositionId)
    const { edges, onMouseEnter, onMouseLeave } = useChartEdges({
        graphEdges: graph.edges,
        lines,
        selectedEdges,
        selectedLineId,
    })
    const selectableNodes = useMemo(
        () => [...graph.nodes, ...linePointNodes(lines, branchPoints)],
        [graph.nodes, lines, branchPoints]
    )
    const pointsDraggable = Boolean(
        editControls?.isEditing && !editControls?.disabled && onMoveLinePoints
    )
    const nodes = useMemo<Node[]>(
        () =>
            selectableNodes.map((node) => {
                const cached =
                    nodeState.layoutKey === layoutKey
                        ? nodeState.nodes[node.id]
                        : undefined
                const isPoint = node.type === linePointNodeType
                const current = isPoint
                    ? {
                          ...node,
                          measured: cached?.node.measured,
                          dragging: cached?.node.dragging,
                      }
                    : (cached?.node ?? node)
                const sameSize =
                    current.style?.width === node.style?.width &&
                    current.style?.height === node.style?.height
                const selected = isNodeSelected(node.id)
                if (
                    !isPoint &&
                    deepEqual(current.data, node.data) &&
                    current.ariaLabel === node.ariaLabel &&
                    sameSize &&
                    current.parentId === node.parentId &&
                    Boolean(current.selected) === selected
                )
                    return current
                return {
                    ...current,
                    style: node.style,
                    ...(isPoint && {
                        draggable: pointsDraggable,
                        style: {
                            ...node.style,
                            pointerEvents: selected ? 'all' : 'none',
                        },
                    }),
                    data: node.data,
                    ariaLabel: node.ariaLabel,
                    ...(!sameSize && {
                        measured: undefined,
                        width: undefined,
                        height: undefined,
                    }),
                    selected,
                }
            }),
        [selectableNodes, nodeState, layoutKey, isNodeSelected, pointsDraggable]
    )
    const { canCopy, canEdit, canPaste, clipboardAction, onKeyDown } =
        useChartClipboard({
            positions,
            lines,
            branchPoints,
            nodes,
            coordinateOffsets: graph.coordinateOffsets,
            groupBounds: graph.groupBounds,
            isEditing: Boolean(editControls?.isEditing),
            disabled: Boolean(editControls?.disabled),
            flowReady,
            flowRef,
            containerRef,
            mousePosition,
            selectPastedNodes,
            clearNodeSelection,
            clearSelectedEdges,
            onPasteSelection,
            onCutSelection,
            onSelectLine,
            onStartEditing: editControls?.onEdit,
        })
    const selectedNodes = nodes.filter(
        (node) => node.selected && node.type !== linePointNodeType
    )
    const tooltipNode =
        editControls &&
        !editControls.disabled &&
        selectedNodes.length === 1 &&
        !nodes.some((node) => node.dragging) &&
        !groupDrag.feedback
            ? selectedNodes[0]
            : undefined
    const onNodesChange: OnNodesChange = (changes) => {
        const resizingIds = new Set(
            changes.flatMap((change) =>
                change.type === 'dimensions' && change.resizing
                    ? [change.id]
                    : []
            )
        )
        const poppedIds = groupDrag.poppedIds()
        let moved = snapNodeCenters(
            applyNodeChanges(changes, nodes),
            new Set(
                changes.flatMap((change) =>
                    change.type === 'position' &&
                    change.position &&
                    !resizingIds.has(change.id) &&
                    !poppedIds.has(change.id)
                        ? [change.id]
                        : []
                )
            )
        )
        const desired = new Map(
            changes.flatMap((change) =>
                change.type === 'position' && change.position && change.dragging
                    ? [[change.id, change.position] as const]
                    : []
            )
        )
        const draggingIds = new Set(desired.keys())
        if (
            draggingIds.size &&
            editControls?.isEditing &&
            !editControls.disabled
        ) {
            moved = alignDuringDrag(
                moved,
                new Set([...draggingIds].filter((id) => !poppedIds.has(id)))
            )
            moved = groupDrag.update(moved, draggingIds, desired)
        }
        const dragEnded = changes.some(
            (change) => change.type === 'position' && change.dragging === false
        )
        moved = finishNodeChanges(moved, dragEnded)
        const carry = groupPointCarry.update(
            nodes,
            moved,
            draggingIds,
            dragEnded
        )
        moved = carry.nodes
        if (changes.some((change) => change.type === 'select'))
            recordNodeSelection(moved)
        const pointChanges: LinePointCoordinates = { ...carry.points }
        for (const change of changes) {
            if (change.type !== 'position' || !change.position) continue
            const pointNode = moved.find(
                (node) =>
                    node.id === change.id && node.type === linePointNodeType
            )
            if (pointNode && typeof pointNode.data.pointId === 'string')
                pointChanges[pointNode.data.pointId] = {
                    x: pointNode.position.x + linePointRadius,
                    y: pointNode.position.y + linePointRadius,
                }
        }
        if (
            editControls?.isEditing &&
            !editControls.disabled &&
            Object.keys(pointChanges).length
        )
            onMoveLinePoints?.(pointChanges)
        if (moved.every((node, index) => node === nodes[index])) return
        setNodeState({
            layoutKey,
            nodes: Object.fromEntries(moved.map((node) => [node.id, { node }])),
        })
    }
    const saveDraggedNodes = (draggedNodes: Node[]) => {
        const session = groupDrag.finish()
        if (!editControls?.isEditing || editControls.disabled) return
        onGroupBoundsChange?.(graph.groupBounds)
        const regrouped =
            session?.kind === 'node' &&
            session.targetGroupId !== session.sourceGroupId
                ? session
                : undefined
        if (regrouped) {
            const { parentGroupId, coordinates } = regroupTarget(
                regrouped,
                nodes,
                graph.groupBounds
            )
            onRegroup?.(Number(regrouped.nodeId), parentGroupId, coordinates)
        }
        const { nodes: snapped, movedIds } = prepareDraggedNodes(
            nodes,
            draggedNodes
        )
        const pointGroups = pointGroupChanges(
            nodes,
            snapped.filter(({ id }) => movedIds.has(id))
        )
        if (Object.keys(pointGroups).length) onPointGroupsChange?.(pointGroups)
        for (const moved of snapped.filter(
            ({ id, type }) =>
                movedIds.has(id) &&
                type !== linePointNodeType &&
                id !== regrouped?.nodeId
        )) {
            const offset = graph.coordinateOffsets.get(moved.id)
            onCoordinatesChange?.(Number(moved.id), {
                x: moved.position.x - (offset?.x ?? 0),
                y: moved.position.y - (offset?.y ?? 0),
            })
        }
    }
    const resizeGroup = (
        id: string,
        box: { x: number; y: number; width: number; height: number }
    ) => {
        if (!editControls?.isEditing || editControls.disabled) return
        const node = graph.nodes.find((item) => item.id === id)
        const bounds = graph.groupBounds.get(Number(id))
        if (!node || !bounds) return
        const left = bounds.x + box.x - node.position.x
        const top = bounds.y + box.y - node.position.y
        // Saved bounds must contain the group's origin, so x and y stay <= 0.
        const x = Math.min(0, left)
        const y = Math.min(0, top)
        onGroupBoundsChange?.(
            new Map([
                [
                    Number(id),
                    {
                        x,
                        y,
                        width: left + box.width - x,
                        height: top + box.height - y,
                    },
                ],
            ])
        )
    }

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            onPointerDownCapture={(event) => {
                if (!(
                    event.target instanceof Element &&
                    event.target.closest(
                        'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
                    )
                ))
                    event.currentTarget.focus({ preventScroll: true })
            }}
            onMouseMove={(event) => {
                mousePosition.current = { x: event.clientX, y: event.clientY }
            }}
            onKeyDown={onKeyDown}
            className={styles.chart}
            data-editing={Boolean(editControls?.isEditing)}
            data-loading={isLoading}
            role="region"
            aria-label="Chart"
            aria-busy={isLoading}
        >
            {error ? (
                <div role="alert">{error}</div>
            ) : (
                <>
                    {isLoading && <ChartLoading />}
                    <LineEditingContext.Provider
                        value={{
                            showHitboxes,
                            directionChevrons,
                            onSelectPoint,
                            onRemovePoint,
                            editing: Boolean(
                                editControls?.isEditing &&
                                !editControls.disabled
                            ),
                            onChange: onChangeLine,
                            branchPoints,
                            lines,
                            onChangeBranchPoint,
                            onPointCoordinates,
                            pointCoordinates,
                            onBranch,
                            onMergeBranch,
                            groupAt: (coordinates) =>
                                groupIdAt(nodes, coordinates),
                            selectedPointIds: new Set([
                                ...(selectedPointId ? [selectedPointId] : []),
                                ...nodes.flatMap((node) =>
                                    node.selected &&
                                    node.type === linePointNodeType &&
                                    typeof node.data.pointId === 'string'
                                        ? [node.data.pointId]
                                        : []
                                ),
                            ]),
                            renderLineTooltip:
                                !editControls?.disabled &&
                                !nodes.some((node) => node.dragging)
                                    ? renderLineTooltip
                                    : undefined,
                            tooltipPointId: selectedPointId,
                            renderPointTooltip:
                                !editControls?.disabled &&
                                !nodes.some((node) => node.dragging)
                                    ? renderPointTooltip
                                    : undefined,
                            placingPointLineId,
                            onPointPlaced,
                            drawingBranchPointId,
                            onBranchDrawn,
                        }}
                    >
                        <TitleHeightContext.Provider value={reportTitleHeight}>
                            <GroupResizeContext.Provider value={resizeGroup}>
                                <GroupDragContext.Provider
                                    value={{
                                        feedback: groupDrag.feedback,
                                        nameOf,
                                    }}
                                >
                                    <ReactFlow
                                        connectionRadius={connectionRadius}
                                        onInit={(flow) => {
                                            flowRef.current = flow
                                            setFlowReady(true)
                                        }}
                                        nodes={nodes}
                                        nodeTypes={nodeTypes}
                                        edgeTypes={edgeTypes}
                                        edges={edges}
                                        onEdgesChange={onEdgesChange}
                                        onEdgeMouseEnter={(_, edge) =>
                                            onMouseEnter(edge.id)
                                        }
                                        onEdgeMouseLeave={(_, edge) =>
                                            onMouseLeave(edge.id)
                                        }
                                        onEdgeClick={(_, edge) => {
                                            selectEdge(edge.id)
                                            onSelectLine?.(edge.id)
                                        }}
                                        zIndexMode="manual"
                                        onNodesChange={onNodesChange}
                                        multiSelectionKeyCode="Shift"
                                        selectionKeyCode="Shift"
                                        onNodeClick={(event, node) => {
                                            if (node.type === linePointNodeType)
                                                return
                                            if (event.shiftKey) return
                                            clearSelectedEdges()
                                            onSelectLine?.(null)
                                            selectNode(node.id, Number(node.id))
                                            const position = positions.find(
                                                (position) =>
                                                    String(position.id) ===
                                                    node.id
                                            )
                                            if (position)
                                                onSelectPosition(position)
                                        }}
                                        onPaneClick={() => {
                                            clearNodeSelection()
                                            onSelectPosition(null)
                                            clearSelectedEdges()
                                            onSelectLine?.(null)
                                        }}
                                        nodesConnectable={Boolean(
                                            editControls?.isEditing &&
                                            !editControls.disabled &&
                                            onConnectPositions
                                        )}
                                        connectionMode={ConnectionMode.Loose}
                                        connectionLineType={
                                            ConnectionLineType.Straight
                                        }
                                        isValidConnection={({
                                            source,
                                            target,
                                        }) =>
                                            Boolean(
                                                editControls?.isEditing &&
                                                !editControls.disabled &&
                                                onConnectPositions &&
                                                canConnectPositions(
                                                    positions,
                                                    Number(source),
                                                    Number(target)
                                                )
                                            )
                                        }
                                        onConnect={({
                                            source,
                                            target,
                                            sourceHandle,
                                            targetHandle,
                                        }) => {
                                            const isSide = (
                                                value: string | null
                                            ): value is HandleSide =>
                                                value === 'top' ||
                                                value === 'right' ||
                                                value === 'bottom' ||
                                                value === 'left'
                                            if (
                                                editControls?.isEditing &&
                                                !editControls.disabled &&
                                                canConnectPositions(
                                                    positions,
                                                    Number(source),
                                                    Number(target)
                                                )
                                            )
                                                onConnectPositions?.(
                                                    Number(source),
                                                    Number(target),
                                                    {
                                                        sourceHandle: isSide(
                                                            sourceHandle
                                                        )
                                                            ? sourceHandle
                                                            : 'bottom',
                                                        targetHandle: isSide(
                                                            targetHandle
                                                        )
                                                            ? targetHandle
                                                            : 'top',
                                                    }
                                                )
                                        }}
                                        snapToGrid={false}
                                        snapGrid={snapGrid}
                                        nodesDraggable={Boolean(
                                            editControls?.isEditing &&
                                            onCoordinatesChange
                                        )}
                                        // React Flow also calls this for selection-box drags.
                                        onNodeDragStop={(
                                            _,
                                            node,
                                            draggedNodes
                                        ) => {
                                            saveDraggedNodes(
                                                draggedNodes.length
                                                    ? draggedNodes
                                                    : [node]
                                            )
                                        }}
                                        edgesReconnectable={false}
                                        deleteKeyCode={null}
                                        proOptions={{ hideAttribution: true }}
                                        panOnScroll
                                        onMoveStart={() => {
                                            if (containerRef.current)
                                                containerRef.current.dataset.moving =
                                                    'true'
                                        }}
                                        onMoveEnd={() => {
                                            if (containerRef.current)
                                                delete containerRef.current
                                                    .dataset.moving
                                        }}
                                        minZoom={0.05}
                                        fitView
                                        fitViewOptions={fitViewOptions}
                                    >
                                        <Background />
                                        <HelperLinesOverlay
                                            {...alignmentGuides}
                                        />
                                        {tooltipNode &&
                                            renderTooltip?.(
                                                Number(tooltipNode.id),
                                                {
                                                    duplicate: () =>
                                                        clipboardAction(
                                                            'duplicate'
                                                        ),
                                                }
                                            )}
                                        <ChartControls
                                            editControls={editControls}
                                            clipboard={
                                                editControls
                                                    ? {
                                                          visible: !(
                                                              !editControls.isEditing &&
                                                              !canCopy
                                                          ),
                                                          canCopy,
                                                          canEdit,
                                                          canPaste,
                                                          copy: () =>
                                                              clipboardAction(
                                                                  'copy'
                                                              ),
                                                          cut: () =>
                                                              clipboardAction(
                                                                  'cut'
                                                              ),
                                                          paste: () =>
                                                              clipboardAction(
                                                                  'paste'
                                                              ),
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </ReactFlow>
                                </GroupDragContext.Provider>
                            </GroupResizeContext.Provider>
                        </TitleHeightContext.Provider>
                    </LineEditingContext.Provider>
                </>
            )}
        </div>
    )
}
