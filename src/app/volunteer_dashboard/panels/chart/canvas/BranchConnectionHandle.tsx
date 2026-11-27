import type { HandleSide } from '../api/domain/chart.types'
import { connectedBranchTargets } from '../api/domain/lineGraph'
import { LineEditingContext } from './LineEditingContext'
import styles from './LinePoint.module.css'
import { useReactFlow, useStore, useStoreApi } from '@xyflow/react'
import { useContext, useEffect, useRef, useState } from 'react'

export function BranchConnectionHandle({
    lineId,
    pointId,
    coordinates,
}: {
    lineId: string
    pointId: string
    coordinates: { x: number; y: number }
}) {
    const {
        editing,
        onBranch,
        onMergeBranch,
        branchPoints,
        lines = [],
        drawingBranchPointId,
        onBranchDrawn,
    } = useContext(LineEditingContext)
    const { screenToFlowPosition } = useReactFlow()
    const store = useStoreApi()
    const chart = useStore((state) => state.domNode)
    const [preview, setPreview] = useState<{ x: number; y: number } | null>(
        null
    )
    const active = editing && !!onBranch && drawingBranchPointId === pointId
    const line = lines.find(({ id }) => id === lineId)
    const blocked =
        active && line ? connectedBranchTargets(line, lines) : undefined
    const mergeTargets = (branchPoints ?? []).filter(
        ({ id }) => id !== pointId && !blocked?.branchPointIds.has(id)
    )
    const findTarget = (clientX: number, clientY: number) => {
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
                blocked?.positionIds.has(id) ||
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
            for (const branch of mergeTargets) {
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
    const latest = useRef({
        findTarget,
        onBranch,
        onMergeBranch,
        onBranchDrawn,
    })
    useEffect(() => {
        latest.current = { findTarget, onBranch, onMergeBranch, onBranchDrawn }
    })
    useEffect(() => {
        if (!active || !chart) return
        const inChart = (event: Event) =>
            event.target instanceof Node && chart.contains(event.target)
        const swallow = (event: Event) => {
            if (inChart(event)) event.stopPropagation()
        }
        const finish = (completed: boolean) => {
            setPreview(null)
            latest.current.onBranchDrawn?.(completed)
        }
        const move = (event: PointerEvent) => {
            const { cursor, nearest } = latest.current.findTarget(
                event.clientX,
                event.clientY
            )
            setPreview(nearest?.coordinates ?? cursor)
        }
        const down = (event: PointerEvent) => {
            if (event.button !== 0 || !inChart(event)) return
            event.preventDefault()
            event.stopPropagation()
            for (const type of ['mousedown', 'mouseup', 'click'])
                window.addEventListener(type, swallow, {
                    capture: true,
                    once: true,
                })
            const { nearest } = latest.current.findTarget(
                event.clientX,
                event.clientY
            )
            if (nearest && 'pointId' in nearest)
                latest.current.onMergeBranch?.(lineId, pointId, nearest.pointId)
            else if (nearest)
                latest.current.onBranch?.(
                    lineId,
                    pointId,
                    nearest.id,
                    nearest.side
                )
            finish(!!nearest)
        }
        const key = (event: KeyboardEvent) => {
            if (event.key === 'Escape') finish(false)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerdown', down, true)
        window.addEventListener('keydown', key)
        chart.classList.add(styles.drawingBranch)
        return () => {
            chart.classList.remove(styles.drawingBranch)
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerdown', down, true)
            window.removeEventListener('keydown', key)
        }
    }, [active, chart, lineId, pointId])
    const shown = active ? (preview ?? coordinates) : null
    if (!shown) return null
    return (
        <g>
            {onMergeBranch &&
                mergeTargets.map((branch) => (
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
            <path
                data-testid="branch-draw-preview"
                d={`M ${coordinates.x},${coordinates.y} L ${shown.x},${shown.y}`}
                fill="none"
                stroke="#0284c7"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                pointerEvents="none"
            />
        </g>
    )
}
