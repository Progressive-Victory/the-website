import type { Line, Position } from '../domain/chart.types'
import { childLines, parentLines } from '../domain/lineGraph'
import styles from '../page.module.css'
import { FormGroup } from '@/components/common/forms/FormGroup'
import { cn } from '@/util'
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6'
import { FiChevronRight } from 'react-icons/fi'

export function PositionLinesField({
    position,
    positions,
    lines,
    onSelectLine,
}: {
    position: Position
    positions: Position[]
    lines: Line[]
    onSelectLine: (id: string) => void
}) {
    const nameOf = (id: number) =>
        positions.find((item) => item.id === id)?.name ?? `Unknown (${id})`
    const forward = (line: Line, path: Line[]): Line[][] => {
        const next = [...path, line]
        if (line.points.at(-1)?.kind === 'anchorpoint') return [next]
        return childLines(line, lines)
            .filter((child) => !next.includes(child))
            .flatMap((child) => forward(child, next))
    }
    const backward = (line: Line, path: Line[]): Line[][] => {
        const next = [line, ...path]
        if (line.points[0]?.kind === 'anchorpoint') return [next]
        return parentLines(line, lines)
            .filter((parent) => !next.includes(parent))
            .flatMap((parent) => backward(parent, next))
    }
    const isAnchoredHere = (point: Line['points'][number] | undefined) =>
        point?.kind === 'anchorpoint' && point.positionId === position.id
    const connected = [
        ...lines
            .filter((line) => isAnchoredHere(line.points[0]))
            .flatMap((line) => forward(line, []))
            .map((path) => ({ path, outgoing: true })),
        ...lines
            .filter((line) => isAnchoredHere(line.points.at(-1)))
            .flatMap((line) => backward(line, []))
            .map((path) => ({ path, outgoing: false })),
    ].map(({ path, outgoing }) => {
        const origin = path[0].points[0]
        const end = path.at(-1)!.points.at(-1)
        const other = outgoing ? end : origin
        return {
            key: `${outgoing}:${path.map(({ id }) => id).join('>')}`,
            lineId: path.at(-1)!.id,
            outgoing,
            label:
                other?.kind === 'anchorpoint'
                    ? nameOf(other.positionId)
                    : 'Unknown',
            pointCount:
                path.reduce((total, line) => total + line.points.length, 0) -
                (path.length - 1),
        }
    })
    return (
        <section aria-label="Lines">
            <FormGroup title="Lines">
                <div className={styles.subPositionsContainer}>
                    {connected.length === 0 && (
                        <div className={styles.subPositionEntryEmpty}>
                            No lines
                        </div>
                    )}
                    {connected.map(
                        ({ key, lineId, outgoing, label, pointCount }) => {
                            const direction = outgoing ? 'Outgoing' : 'Incoming'
                            const DirectionIcon = outgoing
                                ? FaArrowRightLong
                                : FaArrowLeftLong
                            return (
                                <div
                                    key={key}
                                    role="group"
                                    aria-label={`${direction} line ${label}`}
                                    className={cn(
                                        styles.subPositionEntry,
                                        styles.linePointEntry,
                                        styles.linePointRow
                                    )}
                                >
                                    <div
                                        className={cn(
                                            styles.subPositionEntryText,
                                            styles.linePointText
                                        )}
                                    >
                                        <div className={styles.linePointMain}>
                                            <span
                                                className={
                                                    styles.linePointLabel
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.linePointTypeIcon
                                                    }
                                                >
                                                    <span
                                                        role="img"
                                                        aria-label={direction}
                                                        title={direction}
                                                    >
                                                        <DirectionIcon aria-hidden="true" />
                                                    </span>
                                                </span>
                                                <span>{label}</span>
                                            </span>
                                            <div
                                                className={
                                                    styles.linePointValues
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.linePointCoordinates
                                                    }
                                                >
                                                    {pointCount}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.linePointOpen
                                                    }
                                                    aria-label={`View ${direction.toLowerCase()} line ${label}`}
                                                    onClick={() =>
                                                        onSelectLine(lineId)
                                                    }
                                                >
                                                    <FiChevronRight aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>
            </FormGroup>
        </section>
    )
}
