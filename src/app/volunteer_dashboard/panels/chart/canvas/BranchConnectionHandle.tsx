import type { HandleSide } from '../domain/chart.types'
import { LineEditingContext } from './LineEditingContext'
import styles from './LinePoint.module.css'
import { useReactFlow, useStoreApi } from '@xyflow/react'
import { useContext, useRef, useState } from 'react'

export function BranchConnectionHandle({
    lineId,
    pointId,
    coordinates,
}: {
    lineId: string
    pointId: string
    coordinates: { x: number; y: number }
}) {
    const { editing, onBranch, onMergeBranch, branchPoints } =
        useContext(LineEditingContext)
    const { screenToFlowPosition } = useReactFlow()
    const store = useStoreApi()
    const pointer = useRef<number | null>(null)
    const [preview, setPreview] = useState<{ x: number; y: number } | null>(
        null
    )
    if (!editing || !onBranch) return null
    const cancel = () => {
        pointer.current = null
        setPreview(null)
    }
    const findTarget = (
        element: SVGElement,
        clientX: number,
        clientY: number
    ) => {
        const chart = element.closest('.react-flow')
        const cursor = screenToFlowPosition(
            { x: clientX, y: clientY },
            { snapToGrid: false }
        )
        let nearest:
            | {
                  id: number
                  side: HandleSide
                  coordinates: { x: number; y: number }
              }
            | { pointId: string; coordinates: { x: number; y: number } }
            | undefined
        let distance = store.getState().connectionRadius
        for (const handle of chart?.querySelectorAll(
            '.react-flow__handle.connectable.connectableend'
        ) ?? []) {
            if (handle.closest('.react-flow') !== chart) continue
            const side = handle.getAttribute('data-handleid')
            const nodeId = handle.getAttribute('data-nodeid')
            const id = nodeId ? Number(nodeId) : NaN
            if (
                !Number.isInteger(id) ||
                (side !== 'top' &&
                    side !== 'right' &&
                    side !== 'bottom' &&
                    side !== 'left')
            )
                continue
            const bounds = handle.getBoundingClientRect()
            const coordinates = screenToFlowPosition(
                {
                    x: bounds.left + bounds.width / 2,
                    y: bounds.top + bounds.height / 2,
                },
                { snapToGrid: false }
            )
            const candidateDistance = Math.hypot(
                cursor.x - coordinates.x,
                cursor.y - coordinates.y
            )
            if (candidateDistance <= distance) {
                distance = candidateDistance
                nearest = { id, side, coordinates }
            }
        }
        if (onMergeBranch)
            for (const branch of branchPoints ?? []) {
                if (branch.id === pointId) continue
                const candidateDistance = Math.hypot(
                    cursor.x - branch.coordinates.x,
                    cursor.y - branch.coordinates.y
                )
                if (candidateDistance <= distance) {
                    distance = candidateDistance
                    nearest = {
                        pointId: branch.id,
                        coordinates: branch.coordinates,
                    }
                }
            }
        return { cursor, nearest }
    }
    return (
        <g>
            {preview &&
                onMergeBranch &&
                branchPoints
                    ?.filter((branch) => branch.id !== pointId)
                    .map((branch) => (
                        <circle
                            key={branch.id}
                            data-testid="branch-merge-target"
                            cx={branch.coordinates.x}
                            cy={branch.coordinates.y}
                            r={6}
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth={1.5}
                            pointerEvents="none"
                        />
                    ))}
            {preview && (
                <path
                    d={`M ${coordinates.x},${coordinates.y} L ${preview.x},${preview.y}`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    pointerEvents="none"
                />
            )}
            <rect
                role="button"
                aria-label="Create child line"
                className={`nodrag nopan ${styles.branchConnection}`}
                x={coordinates.x + 9}
                y={coordinates.y - 4}
                width={8}
                height={8}
                pointerEvents="all"
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => {
                    if (event.button !== 0) return
                    event.stopPropagation()
                    pointer.current = event.pointerId
                    event.currentTarget.setPointerCapture(event.pointerId)
                    setPreview(coordinates)
                }}
                onPointerMove={(event) => {
                    if (pointer.current !== event.pointerId) return
                    event.stopPropagation()
                    const { cursor, nearest } = findTarget(
                        event.currentTarget,
                        event.clientX,
                        event.clientY
                    )
                    setPreview(nearest?.coordinates ?? cursor)
                }}
                onPointerUp={(event) => {
                    if (pointer.current !== event.pointerId) return
                    event.stopPropagation()
                    const { nearest } = findTarget(
                        event.currentTarget,
                        event.clientX,
                        event.clientY
                    )
                    cancel()
                    event.currentTarget.releasePointerCapture(event.pointerId)
                    if (nearest && 'pointId' in nearest)
                        onMergeBranch?.(lineId, pointId, nearest.pointId)
                    else if (nearest)
                        onBranch(lineId, pointId, nearest.id, nearest.side)
                }}
                onPointerCancel={cancel}
                onLostPointerCapture={cancel}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') cancel()
                }}
                tabIndex={0}
            >
                <title>
                    Drag to a node handle or branchpoint to create a child line
                </title>
            </rect>
        </g>
    )
}
