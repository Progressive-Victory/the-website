import styles from '../page.module.css'
import type { AlignmentGuides } from './magneticAlignment'
import { useViewport } from '@xyflow/react'

export function HelperLinesOverlay({ horizontal, vertical }: AlignmentGuides) {
    const { x, y, zoom } = useViewport()
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
        </svg>
    )
}
