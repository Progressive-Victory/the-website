'use client'

import { type Line, type LinePointData } from '../api/domain/chart.types'
import {
    incomingLineCount,
    isMovablePoint,
    resolveLinePoints,
} from '../api/domain/lineGraph'
import { AngleGuides } from './AngleGuides'
import { BranchConnectionHandle } from './BranchConnectionHandle'
import { LineEditingContext } from './LineEditingContext'
import styles from './LinePoint.module.css'
import {
    angleNeighbors,
    guidesAt,
    snapToAngles,
    type AngleGuideSet,
} from './angleSnap'
import {
    closestSegment,
    insertLinePoint,
    lineHitboxOutline,
    lineVertices,
    pointOnSegment,
} from './linePoints'
import { LINE_POINT_GRID } from './positions.placement'
import type { FlowAnchor } from './tooltip/ChartTooltip'
import { cn } from '@/util'
import {
    BaseEdge,
    ViewportPortal,
    useReactFlow,
    type EdgeProps,
    type Edge,
} from '@xyflow/react'
import {
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type MouseEvent,
    type PointerEvent,
} from 'react'

const LINE_HITBOX_WIDTH = 20
const POINT_HITBOX_RADIUS = 10
const ANGLE_SNAP_PX = 8
const HALO_EXTENT = { waypoint: 2 + 6, branchpoint: 4 + 6 }

const midpointAnchor = (vertices: { x: number; y: number }[]): FlowAnchor => {
    const segments = vertices
        .slice(1)
        .map(
            (
                end,
                index
            ): [{ x: number; y: number }, { x: number; y: number }] => [
                vertices[index],
                end,
            ]
        )
    const [start, end] = segments.reduce((best, segment) =>
        Math.hypot(segment[1].x - segment[0].x, segment[1].y - segment[0].y) >
        Math.hypot(best[1].x - best[0].x, best[1].y - best[0].y)
            ? segment
            : best
    )
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        orientation:
            Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
                ? 'horizontal'
                : 'vertical',
        avoid: segments.filter((segment) => segment[0] !== start),
    }
}

export function PositionEdge({
    id,
    sourceX: nodeSourceX,
    sourceY: nodeSourceY,
    targetX: nodeTargetX,
    targetY: nodeTargetY,
    style,
    markerEnd,
    markerStart,
    interactionWidth = LINE_HITBOX_WIDTH,
    data,
    selected,
}: EdgeProps<
    Edge<{
        line: Line
        branchSource?: { x: number; y: number }
        branchTarget?: { x: number; y: number }
        directlySelected?: boolean
        hitboxHovered?: boolean
    }>
>) {
    const sourceX = data?.branchSource?.x ?? nodeSourceX
    const sourceY = data?.branchSource?.y ?? nodeSourceY
    const targetX = data?.branchTarget?.x ?? nodeTargetX
    const targetY = data?.branchTarget?.y ?? nodeTargetY
    const {
        editing,
        showHitboxes = true,
        directionChevrons = 'all',
        onSelectPoint,
        onRemovePoint,
        onChange,
        onPointCoordinates,
        pointCoordinates,
        branchPoints = [],
        onChangeBranchPoint,
        lines,
        groupAt,
        selectedPointIds,
        renderLineTooltip,
        tooltipPointId,
        renderPointTooltip,
        placingPointLineId,
        onPointPlaced,
    } = useContext(LineEditingContext)
    const { screenToFlowPosition, getZoom, getInternalNode } = useReactFlow()
    const anchorCoordinates = (positionId: number, handleId: string) => {
        const internal = getInternalNode(String(positionId))
        const bounds = internal?.internals.handleBounds
        const handle = [
            ...(bounds?.source ?? []),
            ...(bounds?.target ?? []),
        ].find(({ id }) => id === handleId)
        if (!internal || !handle) return undefined
        const { x, y } = internal.internals.positionAbsolute
        return {
            x:
                x +
                handle.x +
                (handleId === 'left'
                    ? 0
                    : handleId === 'right'
                      ? handle.width
                      : handle.width / 2),
            y:
                y +
                handle.y +
                (handleId === 'top'
                    ? 0
                    : handleId === 'bottom'
                      ? handle.height
                      : handle.height / 2),
        }
    }
    const coordinatesOf = (point: LinePointData) =>
        point.kind === 'waypoint'
            ? point.coordinates
            : point.kind === 'branchpoint'
              ? branchPoints.find(({ id }) => id === point.id)?.coordinates
              : (anchorCoordinates(point.positionId, point.handle) ??
                pointCoordinates?.[point.id])
    const activePointer = useRef<number | null>(null)
    const dragStart = useRef<{ x: number; y: number } | null>(null)
    const pointDragged = useRef(false)
    const [angleGuides, setAngleGuides] = useState<{
        guides: AngleGuideSet
        halo: number
    } | null>(null)
    const placing = editing && placingPointLineId === id
    const [placementPreview, setPlacementPreview] = useState<{
        segment: number
        x: number
        y: number
        settling?: boolean
    } | null>(null)
    const commitPlacement = () => {
        if (!placementPreview || !line || !onChange) return
        const { segment, x, y } = placementPreview
        onChange(insertLinePoint(line, segment, { x, y }, groupAt?.({ x, y })))
        setPlacementPreview(null)
        onPointPlaced?.()
    }
    const selectedMarkerId = useId()
    const pointColor = selected
        ? 'var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))'
        : (style?.stroke ??
          'var(--xy-edge-stroke, var(--xy-edge-stroke-default))')
    const line = lines ? lines.find((line) => line.id === id) : data?.line
    const resolved = line ? resolveLinePoints(line, branchPoints) : undefined
    const tooltipPoint = resolved?.points
        .slice(1)
        .filter(isMovablePoint)
        .find((point) => point.id === tooltipPointId)
    const sourcePointId = line?.points[0]?.id
    const targetPointId = line?.points.at(-1)?.id
    useEffect(() => {
        if (!selected || !sourcePointId || !targetPointId) return
        onPointCoordinates?.({
            [sourcePointId]: { x: sourceX, y: sourceY },
            [targetPointId]: { x: targetX, y: targetY },
        })
    }, [
        selected,
        sourcePointId,
        targetPointId,
        sourceX,
        sourceY,
        targetX,
        targetY,
        onPointCoordinates,
    ])
    const vertices = resolved
        ? lineVertices(
              resolved,
              { x: sourceX, y: sourceY },
              { x: targetX, y: targetY }
          )
        : [
              { x: sourceX, y: sourceY },
              { x: targetX, y: targetY },
          ]
    const path = vertices
        .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x},${y}`)
        .join(' ')
    return (
        <>
            {selected && markerEnd && (
                <defs>
                    <marker
                        id={selectedMarkerId}
                        markerWidth={12.5}
                        markerHeight={12.5}
                        viewBox="-10 -10 20 20"
                        markerUnits="strokeWidth"
                        orient="auto-start-reverse"
                        refX={0}
                        refY={0}
                        stroke={pointColor}
                        fill={pointColor}
                    >
                        <polyline
                            points="-5,-4 0,0 -5,4 -5,-4"
                            strokeWidth={1}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>
            )}
            <g
                className={styles.lineHitboxGroup}
                data-hitbox-hovered={data?.hitboxHovered}
                style={placing ? { cursor: 'crosshair' } : undefined}
                onPointerMove={(event) => {
                    if (!placing || placementPreview?.settling) return
                    const cursor = screenToFlowPosition(
                        { x: event.clientX, y: event.clientY },
                        { snapToGrid: false }
                    )
                    const segment = closestSegment(vertices, cursor)
                    const { x, y } = pointOnSegment(vertices, segment, cursor)
                    setPlacementPreview({
                        segment,
                        x: Math.round(x / LINE_POINT_GRID) * LINE_POINT_GRID,
                        y: Math.round(y / LINE_POINT_GRID) * LINE_POINT_GRID,
                    })
                }}
                onPointerLeave={() => {
                    if (!placementPreview?.settling) setPlacementPreview(null)
                }}
                onClick={(event) => {
                    if (!placing || !placementPreview) return
                    event.stopPropagation()
                    if (placementPreview.settling) return
                    if (
                        window.matchMedia('(prefers-reduced-motion: reduce)')
                            .matches
                    )
                        commitPlacement()
                    else
                        setPlacementPreview({
                            ...placementPreview,
                            settling: true,
                        })
                }}
                onDoubleClick={(event) => {
                    if (!editing || !line || !onChange) return
                    event.stopPropagation()
                    const coordinates = screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    })
                    onChange(
                        insertLinePoint(
                            line,
                            closestSegment(vertices, coordinates),
                            coordinates,
                            groupAt?.(coordinates)
                        )
                    )
                }}
            >
                <path
                    data-testid="line-selection-hitbox"
                    className={styles.lineHitbox}
                    visibility={showHitboxes ? 'visible' : 'hidden'}
                    d={lineHitboxOutline(vertices, interactionWidth)}
                    stroke="none"
                    pointerEvents="all"
                    aria-hidden="true"
                />
                <BaseEdge
                    id={id}
                    path={path}
                    interactionWidth={0}
                    style={{ ...style, stroke: pointColor }}
                    markerEnd={
                        selected && markerEnd
                            ? `url(#${selectedMarkerId})`
                            : markerEnd
                    }
                    markerStart={markerStart}
                />
                {placing && placementPreview && (
                    <rect
                        data-testid="line-point-placement"
                        className={cn(
                            styles.placementDiamond,
                            placementPreview.settling &&
                                styles.placementSettling
                        )}
                        x={placementPreview.x - 2}
                        y={placementPreview.y - 2}
                        width={4}
                        height={4}
                        pointerEvents="none"
                        onAnimationEnd={commitPlacement}
                    />
                )}
            </g>
            {directionChevrons !== 'none' && (
                <g pointerEvents="none" aria-hidden="true">
                    {vertices.slice(1).map((end, index) => {
                        const start = vertices[index]
                        if (start.x === end.x && start.y === end.y) return null
                        if (
                            directionChevrons === 'merges' &&
                            ![
                                line?.points[index],
                                line?.points[index + 1],
                            ].some(
                                (point) =>
                                    point?.kind === 'branchpoint' &&
                                    incomingLineCount(point.id, lines ?? []) > 1
                            )
                        )
                            return null
                        const angle =
                            (Math.atan2(end.y - start.y, end.x - start.x) *
                                180) /
                            Math.PI
                        return (
                            <g
                                key={`${index}-${start.x}-${start.y}-${end.x}-${end.y}`}
                                transform={`translate(${(start.x + end.x) / 2} ${(start.y + end.y) / 2}) rotate(${angle})`}
                            >
                                <polyline
                                    points="-3,-5 3,0 -3,5"
                                    className={styles.directionChevronHalo}
                                />
                                <polyline
                                    data-testid="line-direction-chevron"
                                    points="-3,-5 3,0 -3,5"
                                    className={styles.directionChevron}
                                    style={{ stroke: pointColor }}
                                />
                            </g>
                        )
                    })}
                </g>
            )}
            {!(editing && selected) && resolved && (
                <g pointerEvents="none" aria-hidden="true">
                    {resolved.points
                        .slice(1)
                        .map(
                            (point) =>
                                isMovablePoint(point) &&
                                (point.kind === 'branchpoint' ? (
                                    <circle
                                        key={point.id}
                                        cx={point.coordinates.x}
                                        cy={point.coordinates.y}
                                        r={2}
                                        className={styles.readOnlyPoint}
                                        style={{ fill: pointColor }}
                                    />
                                ) : (
                                    <rect
                                        key={point.id}
                                        x={point.coordinates.x - 2}
                                        y={point.coordinates.y - 2}
                                        width={4}
                                        height={4}
                                        className={styles.readOnlyPoint}
                                        style={{ fill: pointColor }}
                                    />
                                ))
                        )}
                </g>
            )}
            {!(editing && selected) && line && resolved && onSelectPoint && (
                <ViewportPortal>
                    <svg
                        className={styles.selectedPointLayer}
                        aria-label="Line point selection"
                    >
                        {resolved.points.slice(1).map((point, index) => {
                            if (!isMovablePoint(point)) return null
                            return (
                                <g
                                    key={point.id}
                                    className={styles.splitCircle}
                                >
                                    <circle
                                        data-testid="line-point-hitbox"
                                        className={styles.pointHitbox}
                                        cx={point.coordinates.x}
                                        cy={point.coordinates.y}
                                        r={POINT_HITBOX_RADIUS}
                                        visibility={
                                            showHitboxes ? 'visible' : 'hidden'
                                        }
                                        pointerEvents="none"
                                        aria-hidden="true"
                                    />
                                    <circle
                                        role="button"
                                        aria-label={`View line point ${index + 1}`}
                                        tabIndex={0}
                                        className={`nodrag nopan ${styles.pointButton}`}
                                        cx={point.coordinates.x}
                                        cy={point.coordinates.y}
                                        r={POINT_HITBOX_RADIUS}
                                        fill="transparent"
                                        pointerEvents="all"
                                        style={{ cursor: 'pointer' }}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onSelectPoint(id, point.id)
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key !== 'Enter' &&
                                                event.key !== ' '
                                            )
                                                return
                                            event.preventDefault()
                                            event.stopPropagation()
                                            onSelectPoint(id, point.id)
                                        }}
                                    />
                                    {point.kind === 'branchpoint' ? (
                                        <circle
                                            cx={point.coordinates.x}
                                            cy={point.coordinates.y}
                                            r={2}
                                            fill={pointColor}
                                            pointerEvents="none"
                                        />
                                    ) : (
                                        <rect
                                            x={point.coordinates.x - 2}
                                            y={point.coordinates.y - 2}
                                            width={4}
                                            height={4}
                                            fill={pointColor}
                                            pointerEvents="none"
                                        />
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </ViewportPortal>
            )}
            {editing && selected && line && resolved && (
                <ViewportPortal>
                    <svg
                        className={styles.selectedPointLayer}
                        aria-label="Selected line points"
                    >
                        {resolved.points.slice(1).map((point, index) => {
                            if (!isMovablePoint(point)) return null
                            const Shape =
                                point.kind === 'branchpoint' ? 'circle' : 'rect'
                            const shapeProps =
                                point.kind === 'branchpoint'
                                    ? {
                                          cx: point.coordinates.x,
                                          cy: point.coordinates.y,
                                          r: 4,
                                      }
                                    : {
                                          x: point.coordinates.x - 2,
                                          y: point.coordinates.y - 2,
                                          width: 4,
                                          height: 4,
                                      }
                            const hitboxProps = {
                                cx: point.coordinates.x,
                                cy: point.coordinates.y,
                                r: POINT_HITBOX_RADIUS,
                            }
                            const adjacentNeighbors = () => {
                                const neighbors: {
                                    id: string
                                    x: number
                                    y: number
                                }[] = []
                                for (const neighborIndex of [
                                    index,
                                    index + 2,
                                ]) {
                                    const neighbor = line.points[neighborIndex]
                                    const coordinates = vertices[neighborIndex]
                                    if (neighbor && coordinates)
                                        neighbors.push({
                                            id: neighbor.id,
                                            ...coordinates,
                                        })
                                }
                                if (point.kind === 'branchpoint') {
                                    for (const segment of lines ?? []) {
                                        const junctionIndex =
                                            segment.points.findIndex(
                                                ({ id }) => id === point.id
                                            )
                                        if (
                                            junctionIndex < 0 ||
                                            segment.id === line.id
                                        )
                                            continue
                                        for (const neighbor of [
                                            segment.points[junctionIndex - 1],
                                            segment.points[junctionIndex + 1],
                                        ]) {
                                            if (!neighbor) continue
                                            const coordinates =
                                                neighbor.kind === 'waypoint'
                                                    ? neighbor.coordinates
                                                    : neighbor.kind ===
                                                        'branchpoint'
                                                      ? branchPoints.find(
                                                            ({ id }) =>
                                                                id ===
                                                                neighbor.id
                                                        )?.coordinates
                                                      : (anchorCoordinates(
                                                            neighbor.positionId,
                                                            neighbor.handle
                                                        ) ??
                                                        pointCoordinates?.[
                                                            neighbor.id
                                                        ])
                                            if (coordinates)
                                                neighbors.push({
                                                    id: neighbor.id,
                                                    ...coordinates,
                                                })
                                        }
                                    }
                                }
                                return neighbors
                            }
                            const adjacentSnapTarget = (coordinates: {
                                x: number
                                y: number
                            }) => {
                                let target:
                                    | { id: string; x: number; y: number }
                                    | undefined
                                let distance = hitboxProps.r * 2
                                for (const neighbor of adjacentNeighbors()) {
                                    if (!neighbor) continue
                                    const nextDistance = Math.hypot(
                                        coordinates.x - neighbor.x,
                                        coordinates.y - neighbor.y
                                    )
                                    if (nextDistance <= distance) {
                                        target = neighbor
                                        distance = nextDistance
                                    }
                                }
                                return target
                            }
                            return (
                                <g
                                    key={point.id}
                                    className={styles.splitCircle}
                                    data-selected={selectedPointIds?.has(
                                        point.id
                                    )}
                                >
                                    <circle
                                        data-testid="line-point-hitbox"
                                        className={styles.pointHitbox}
                                        visibility={
                                            showHitboxes ? 'visible' : 'hidden'
                                        }
                                        {...hitboxProps}
                                        pointerEvents="none"
                                        aria-hidden="true"
                                    />
                                    <Shape
                                        {...shapeProps}
                                        className={`${styles.splitHalo} ${styles.haloEditable}`}
                                        pointerEvents="none"
                                    />
                                    <circle
                                        role="button"
                                        className={`nodrag nopan ${styles.pointButton}`}
                                        aria-label={`Drag line point ${index + 1}`}
                                        tabIndex={0}
                                        {...hitboxProps}
                                        fill="transparent"
                                        pointerEvents="all"
                                        style={{
                                            cursor: 'move',
                                            touchAction: 'none',
                                        }}
                                        onClick={(
                                            event: MouseEvent<SVGElement>
                                        ) => event.stopPropagation()}
                                        onDoubleClick={(
                                            event: MouseEvent<SVGElement>
                                        ) => event.stopPropagation()}
                                        onPointerDown={(
                                            event: PointerEvent<SVGElement>
                                        ) => {
                                            if (event.button !== 0) return
                                            event.stopPropagation()
                                            activePointer.current =
                                                event.pointerId
                                            dragStart.current = {
                                                x: event.clientX,
                                                y: event.clientY,
                                            }
                                            pointDragged.current = false
                                            event.currentTarget.setPointerCapture(
                                                event.pointerId
                                            )
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key !== 'Enter' &&
                                                event.key !== ' '
                                            )
                                                return
                                            event.preventDefault()
                                            event.stopPropagation()
                                            onSelectPoint?.(id, point.id)
                                        }}
                                        onPointerMove={(
                                            event: PointerEvent<SVGElement>
                                        ) => {
                                            if (
                                                activePointer.current !==
                                                event.pointerId
                                            )
                                                return
                                            event.stopPropagation()
                                            const start = dragStart.current
                                            if (
                                                !pointDragged.current &&
                                                (!start ||
                                                    Math.hypot(
                                                        event.clientX - start.x,
                                                        event.clientY - start.y
                                                    ) < 3)
                                            )
                                                return
                                            pointDragged.current = true
                                            const coordinates =
                                                screenToFlowPosition(
                                                    {
                                                        x: event.clientX,
                                                        y: event.clientY,
                                                    },
                                                    { snapToGrid: false }
                                                )
                                            const target =
                                                adjacentSnapTarget(coordinates)
                                            const neighbors = angleNeighbors(
                                                lines ?? [line],
                                                point,
                                                coordinatesOf
                                            )
                                            const angled = target
                                                ? undefined
                                                : snapToAngles(
                                                      coordinates,
                                                      neighbors,
                                                      ANGLE_SNAP_PX / getZoom()
                                                  )
                                            const snapped = target
                                                ? { x: target.x, y: target.y }
                                                : (angled ?? {
                                                      x:
                                                          Math.round(
                                                              coordinates.x /
                                                                  LINE_POINT_GRID
                                                          ) * LINE_POINT_GRID,
                                                      y:
                                                          Math.round(
                                                              coordinates.y /
                                                                  LINE_POINT_GRID
                                                          ) * LINE_POINT_GRID,
                                                  })
                                            setAngleGuides(
                                                target
                                                    ? null
                                                    : {
                                                          guides: guidesAt(
                                                              snapped,
                                                              neighbors
                                                          ),
                                                          halo: HALO_EXTENT[
                                                              point.kind
                                                          ],
                                                      }
                                            )
                                            if (point.kind === 'branchpoint') {
                                                onChangeBranchPoint?.({
                                                    id: point.id,
                                                    coordinates: snapped,
                                                    parentGroupId:
                                                        groupAt?.(snapped),
                                                })
                                                return
                                            }
                                            onChange?.({
                                                ...line,
                                                points: line.points.map(
                                                    (item) =>
                                                        item.id === point.id
                                                            ? {
                                                                  ...point,
                                                                  coordinates:
                                                                      snapped,
                                                                  parentGroupId:
                                                                      groupAt?.(
                                                                          snapped
                                                                      ),
                                                              }
                                                            : item
                                                ),
                                            })
                                        }}
                                        onPointerUp={(
                                            event: PointerEvent<SVGElement>
                                        ) => {
                                            if (
                                                activePointer.current !==
                                                event.pointerId
                                            )
                                                return
                                            event.stopPropagation()
                                            activePointer.current = null
                                            setAngleGuides(null)
                                            event.currentTarget.releasePointerCapture(
                                                event.pointerId
                                            )
                                            const start = dragStart.current
                                            dragStart.current = null
                                            const dragged =
                                                pointDragged.current ||
                                                (start !== null &&
                                                    Math.hypot(
                                                        event.clientX - start.x,
                                                        event.clientY - start.y
                                                    ) >= 3)
                                            pointDragged.current = false
                                            if (!start) return
                                            if (!dragged) {
                                                onSelectPoint?.(id, point.id)
                                                return
                                            }
                                            const dropped =
                                                screenToFlowPosition(
                                                    {
                                                        x: event.clientX,
                                                        y: event.clientY,
                                                    },
                                                    { snapToGrid: false }
                                                )
                                            const target =
                                                adjacentSnapTarget(dropped)
                                            if (target)
                                                onRemovePoint?.(
                                                    id,
                                                    point.id,
                                                    target.id
                                                )
                                        }}
                                        onPointerCancel={() => {
                                            activePointer.current = null
                                            dragStart.current = null
                                            pointDragged.current = false
                                            setAngleGuides(null)
                                        }}
                                        onLostPointerCapture={() => {
                                            activePointer.current = null
                                            dragStart.current = null
                                            pointDragged.current = false
                                            setAngleGuides(null)
                                        }}
                                    />
                                    <Shape
                                        {...shapeProps}
                                        data-testid="line-point-visible"
                                        className={styles.splitHandle}
                                        pointerEvents="none"
                                        aria-hidden="true"
                                    />
                                    {point.kind === 'branchpoint' && (
                                        <BranchConnectionHandle
                                            lineId={id}
                                            pointId={point.id}
                                            coordinates={point.coordinates}
                                        />
                                    )}
                                </g>
                            )
                        })}
                        {angleGuides && (
                            <AngleGuides
                                guides={angleGuides.guides}
                                minSquareSize={angleGuides.halo}
                            />
                        )}
                    </svg>
                </ViewportPortal>
            )}
            {data?.directlySelected &&
                line &&
                !angleGuides &&
                !line.points.some(({ id }) => selectedPointIds?.has(id)) &&
                renderLineTooltip?.(id, midpointAnchor(vertices))}
            {data?.directlySelected &&
                line &&
                tooltipPoint &&
                !angleGuides &&
                renderPointTooltip?.(id, tooltipPoint.id, {
                    ...tooltipPoint.coordinates,
                    orientation: 'point',
                    avoid: angleNeighbors(
                        lines ?? [line],
                        tooltipPoint,
                        coordinatesOf
                    ).map((neighbor) => [neighbor, tooltipPoint.coordinates]),
                })}
        </>
    )
}
