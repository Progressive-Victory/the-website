import styles from '../page.module.css'
import type { SpacingGuide } from './equalSpacing'
import type { AlignmentGuides } from './magneticAlignment'
import { useViewport } from '@xyflow/react'

const TICK = 5

function SpacingMarker({
    guide,
    toScreen,
}: {
    guide: SpacingGuide
    toScreen: (x: number, y: number) => { x: number; y: number }
}) {
    const horizontal = guide.axis === 'x'
    const start = horizontal
        ? toScreen(guide.start, guide.cross)
        : toScreen(guide.cross, guide.start)
    const end = horizontal
        ? toScreen(guide.end, guide.cross)
        : toScreen(guide.cross, guide.end)
    const tick = (point: { x: number; y: number }) =>
        horizontal
            ? {
                  x1: point.x,
                  x2: point.x,
                  y1: point.y - TICK,
                  y2: point.y + TICK,
              }
            : {
                  x1: point.x - TICK,
                  x2: point.x + TICK,
                  y1: point.y,
                  y2: point.y,
              }
    return (
        <g className={styles.spacingGuide} data-testid="spacing-guide">
            <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <line {...tick(start)} />
            <line {...tick(end)} />
        </g>
    )
}

export function HelperLinesOverlay({
    horizontal,
    vertical,
    spacing,
}: AlignmentGuides) {
    const { x, y, zoom } = useViewport()
    if (!horizontal && !vertical && !spacing?.length) return null
    const toScreen = (px: number, py: number) => ({
        x: px * zoom + x,
        y: py * zoom + y,
    })
    return (
        <svg className={styles.helperLines} aria-hidden="true">
            {vertical && (
                <line
                    data-testid="vertical-helper-line"
                    x1={vertical.position * zoom + x}
                    x2={vertical.position * zoom + x}
                    y1="0"
                    y2="100%"
                    strokeDasharray={vertical.center ? '5 5' : undefined}
                />
            )}
            {horizontal && (
                <line
                    data-testid="horizontal-helper-line"
                    y1={horizontal.position * zoom + y}
                    y2={horizontal.position * zoom + y}
                    x1="0"
                    x2="100%"
                    strokeDasharray={horizontal.center ? '5 5' : undefined}
                />
            )}
            {spacing?.map((guide) => (
                <SpacingMarker
                    key={`${guide.axis}:${guide.start}:${guide.end}:${guide.cross}`}
                    guide={guide}
                    toScreen={toScreen}
                />
            ))}
        </svg>
    )
}
