'use client'

import { type Line } from '../domain/chart.types'
import {
    incomingLineCount,
    isMovablePoint,
    resolveLinePoints,
} from '../domain/lineGraph'
import { BranchConnectionHandle } from './BranchConnectionHandle'
import { LineEditingContext } from './LineEditingContext'
import styles from './LinePoint.module.css'
import {
    closestSegment,
    insertLinePoint,
    lineHitboxOutline,
    lineVertices,
} from './linePoints'
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
    type MouseEvent,
    type PointerEvent,
} from 'react'

const LINE_HITBOX_WIDTH = 20
const POINT_HITBOX_RADIUS = 10

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
    } = useContext(LineEditingContext)
    const { screenToFlowPosition } = useReactFlow()
    const activePointer = useRef<number | null>(null)
    const dragStart = useRef<{ x: number; y: number } | null>(null)
    const pointDragged = useRef(false)
    const selectedMarkerId = useId()
    const pointColor = selected
        ? 'var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))'
        : (style?.stroke ??
          'var(--xy-edge-stroke, var(--xy-edge-stroke-default))')
    const line = lines ? lines.find((line) => line.id === id) : data?.line
    const resolved = line ? resolveLinePoints(line, branchPoints) : undefined
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
                            coordinates
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
                            <polyline
                                key={`${index}-${start.x}-${start.y}-${end.x}-${end.y}`}
                                data-testid="line-direction-chevron"
                                points="-3,-5 3,0 -3,5"
                                transform={`translate(${(start.x + end.x) / 2} ${(start.y + end.y) / 2}) rotate(${angle})`}
                                className={styles.directionChevron}
                                style={{ stroke: pointColor }}
                            />
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
            {!editing && line && resolved && onSelectPoint && (
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
                                        className="nodrag nopan"
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
                            const adjacentSnapTarget = (coordinates: {
                                x: number
                                y: number
                            }) => {
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
                                                      : pointCoordinates?.[
                                                            neighbor.id
                                                        ]
                                            if (coordinates)
                                                neighbors.push({
                                                    id: neighbor.id,
                                                    ...coordinates,
                                                })
                                        }
                                    }
                                }
                                let target:
                                    | { id: string; x: number; y: number }
                                    | undefined
                                let distance = hitboxProps.r * 2
                                for (const neighbor of neighbors) {
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
                                        className="nodrag nopan"
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
                                            const snapped = target
                                                ? { x: target.x, y: target.y }
                                                : {
                                                      x:
                                                          Math.round(
                                                              coordinates.x / 5
                                                          ) * 5,
                                                      y:
                                                          Math.round(
                                                              coordinates.y / 5
                                                          ) * 5,
                                                  }
                                            if (point.kind === 'branchpoint') {
                                                onChangeBranchPoint?.({
                                                    id: point.id,
                                                    coordinates: snapped,
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
                                        }}
                                        onLostPointerCapture={() => {
                                            activePointer.current = null
                                            dragStart.current = null
                                            pointDragged.current = false
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
                    </svg>
                </ViewportPortal>
            )}
        </>
    )
}
