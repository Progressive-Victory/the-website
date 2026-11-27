'use client'

import styles from './LinePoint.module.css'
import type { AngleGuideSet, AngleSector } from './angleSnap'
import { cn } from '@/util'
import { useStore } from '@xyflow/react'

interface Point {
    x: number
    y: number
}

const toDegrees = (radians: number) =>
    Math.round((Math.abs(radians) * 180) / Math.PI)

const arcPath = (
    center: Point,
    radius: number,
    start: number,
    sweep: number
) => {
    const end = start + sweep
    return `M ${center.x + Math.cos(start) * radius} ${center.y + Math.sin(start) * radius} A ${radius} ${radius} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${sweep > 0 ? 1 : 0} ${center.x + Math.cos(end) * radius} ${center.y + Math.sin(end) * radius}`
}

const rightAnglePath = (
    center: Point,
    size: number,
    start: number,
    sweep: number
) => {
    const offset = (angle: number) => ({
        x: Math.cos(angle) * size,
        y: Math.sin(angle) * size,
    })
    const at = (...offsets: Point[]) =>
        offsets.reduce(
            (sum, { x, y }) => ({ x: sum.x + x, y: sum.y + y }),
            center
        )
    const xy = ({ x, y }: Point) => `${x} ${y}`
    const a = offset(start)
    const b = offset(start + sweep)
    return `M ${xy(at(a))} L ${xy(at(a, b))} L ${xy(at(b))}`
}

function Sector({
    center,
    sector: { start, sweep, snapped, fromBaseline },
    radius,
    squareSize,
    zoom,
}: {
    center: Point
    sector: AngleSector
    radius: number
    squareSize: number
    zoom: number
}) {
    const degrees = toDegrees(sweep)
    const square = snapped && degrees === 90
    const labelAngle =
        fromBaseline && degrees === 0 ? -Math.PI / 6 : start + sweep / 2
    const labelRadius = radius + 13 / zoom
    return (
        <g className={cn(styles.angleGuide, snapped && styles.angleSnapped)}>
            {fromBaseline && (
                <line
                    className={styles.angleBaseline}
                    x1={center.x}
                    y1={center.y}
                    x2={center.x + radius * 1.6}
                    y2={center.y}
                    strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                />
            )}
            {degrees > 0 && degrees !== 180 && (
                <path
                    className={cn(
                        styles.angleArc,
                        square && styles.angleSquare
                    )}
                    d={
                        square
                            ? rightAnglePath(center, squareSize, start, sweep)
                            : arcPath(center, radius, start, sweep)
                    }
                />
            )}
            <text
                className={styles.angleLabel}
                x={center.x + Math.cos(labelAngle) * labelRadius}
                y={center.y + Math.sin(labelAngle) * labelRadius}
                fontSize={10 / zoom}
                strokeWidth={3 / zoom}
            >
                {degrees}°
            </text>
        </g>
    )
}

export function AngleGuides({
    guides,
    minSquareSize = 0,
}: {
    guides: AngleGuideSet
    minSquareSize?: number
}) {
    const zoom = useStore((state) => state.transform[2])
    const overshoot = 48 / zoom
    return (
        <g
            pointerEvents="none"
            aria-hidden="true"
            style={{ strokeWidth: 1 / zoom }}
        >
            {guides.snapLines.map(([neighbor, point], index) => {
                const angle = Math.atan2(
                    neighbor.y - point.y,
                    neighbor.x - point.x
                )
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)
                return (
                    <line
                        key={index}
                        className={cn(
                            styles.angleGuide,
                            styles.angleSnapped,
                            styles.angleRay
                        )}
                        x1={point.x - cos * overshoot}
                        y1={point.y - sin * overshoot}
                        x2={neighbor.x + cos * overshoot}
                        y2={neighbor.y + sin * overshoot}
                        strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                    />
                )
            })}
            {guides.vertices.map(({ center, sectors }, vertex) =>
                sectors.map((sector, index) => (
                    <Sector
                        key={`${vertex}:${index}`}
                        center={center}
                        sector={sector}
                        radius={(vertex ? 16 : 24) / zoom}
                        squareSize={Math.max(
                            14 / zoom,
                            minSquareSize + 0.5 / zoom
                        )}
                        zoom={zoom}
                    />
                ))
            )}
        </g>
    )
}
