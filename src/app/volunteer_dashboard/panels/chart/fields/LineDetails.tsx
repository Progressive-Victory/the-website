import type { LinePointCoordinates } from '../canvas/LineEditingContext'
import {
    type Line,
    type LinePointData,
    type BranchPoint,
} from '../domain/chart.types'
import {
    lineError,
    isMovablePoint,
    parentLine,
    childLines,
    incomingLineCount,
} from '../domain/lineGraph'
import styles from '../page.module.css'
import { BackButton } from '@/components/common/buttons'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { FormGroup } from '@/components/common/forms/FormGroup'
import { cn } from '@/util'
import { Fragment, useState, type ReactNode } from 'react'
import { FaCodeCommit, FaCodeCompare, FaCodeMerge } from 'react-icons/fa6'
import { FiChevronRight } from 'react-icons/fi'

export function LineDetails({
    line,
    lines = [],
    branchPoints = [],
    pointCoordinates,
    editing,
    disabled,
    onChange,
    onDelete,
    onAddPoint,
    onDeleteBranchPoint,
    usedBranchPoints,
    selectedPointId: controlledPointId,
    onSelectPoint,
}: {
    line: Line
    lines?: Line[]
    branchPoints?: BranchPoint[]
    pointCoordinates: LinePointCoordinates
    editing: boolean
    disabled: boolean
    onChange: (line: Line, branchPoints?: BranchPoint[]) => void
    onDelete: () => void
    onAddPoint: () => void
    onDeleteBranchPoint?: (id: string) => void
    usedBranchPoints?: ReadonlySet<string>
    selectedPointId?: string | null
    onSelectPoint?: (id: string | null) => void
}) {
    const [localPointId, setLocalPointId] = useState<string | null>(null)
    const selectedPointId =
        controlledPointId === undefined ? localPointId : controlledPointId
    const setSelectedPointId = (id: string | null) => {
        setLocalPointId(id)
        onSelectPoint?.(id)
    }
    const selectedPoint = [line, ...lines]
        .flatMap((owner) => owner.points)
        .find((point) => point.id === selectedPointId)
    const detailPointId = selectedPoint?.id
    const typeLabel =
        selectedPoint?.kind === 'waypoint'
            ? 'Waypoint'
            : selectedPoint?.kind === 'branchpoint'
              ? 'Branchpoint'
              : 'Anchor point'
    const typeLocked =
        disabled || !!(detailPointId && usedBranchPoints?.has(detailPointId))
    const changePointType = (kind: 'waypoint' | 'branchpoint') => {
        const owner = [line, ...lines].find((item) =>
            item.points.slice(1).some((point) => point.id === detailPointId)
        )
        if (!owner || !selectedPoint || selectedPoint.kind === 'anchorpoint')
            throw new Error('The selected point cannot be converted.')
        const coordinates =
            selectedPoint.kind === 'waypoint'
                ? selectedPoint.coordinates
                : branchPoints.find(({ id }) => id === selectedPoint.id)
                      ?.coordinates
        if (!coordinates)
            throw new Error(`Missing coordinates for point ${selectedPoint.id}`)
        const next: LinePointData =
            kind === 'branchpoint'
                ? { id: selectedPoint.id, kind }
                : { id: selectedPoint.id, kind, coordinates }
        onChange(
            {
                ...owner,
                points: owner.points.map((point) =>
                    point.id === next.id ? next : point
                ),
            },
            kind === 'branchpoint'
                ? [...branchPoints, { id: next.id, coordinates }]
                : branchPoints.filter(({ id }) => id !== next.id)
        )
    }
    const error = lineError(line)
    const chain: Line[] = []
    const visited = new Set<string>()
    let current: Line | undefined = line
    while (current && !visited.has(current.id)) {
        chain.unshift(current)
        visited.add(current.id)
        current = parentLine(current, lines)
    }
    const points = chain.flatMap((owner, index) =>
        owner.points
            .slice(index === 0 ? 0 : 1)
            .map((point) => ({ point, owner }))
    )
    const renderPoints = (entries: typeof points, offset: number) =>
        entries.map(({ point, owner }, localIndex) => {
            if (detailPointId && point.id !== detailPointId) return null
            const index = offset + localIndex
            const free = point.kind !== 'anchorpoint'
            const junction =
                point.id === owner.points.at(-1)?.id &&
                point.kind === 'branchpoint'
            const removable =
                free &&
                (!junction ||
                    (!!onDeleteBranchPoint &&
                        incomingLineCount(point.id, lines) < 2))
            const coordinates =
                point.kind === 'branchpoint'
                    ? branchPoints.find(({ id }) => id === point.id)
                          ?.coordinates
                    : isMovablePoint(point)
                      ? point.coordinates
                      : pointCoordinates[point.id]
            const title = `Point ${index + 1}${
                junction
                    ? ' (Branch)'
                    : index === 0
                      ? ' (Start Point)'
                      : point.kind === 'anchorpoint'
                        ? ' (End Point)'
                        : ''
            }`
            const pointType =
                point.kind === 'branchpoint'
                    ? 'Branchpoint'
                    : point.kind === 'waypoint'
                      ? 'Waypoint'
                      : index === 0
                        ? 'Start point'
                        : 'End point'
            const PointIcon =
                point.kind === 'branchpoint'
                    ? FaCodeMerge
                    : point.kind === 'waypoint'
                      ? FaCodeCommit
                      : FaCodeCompare
            return (
                <div
                    key={point.id}
                    role="group"
                    aria-label={title}
                    className={cn(
                        styles.subPositionEntry,
                        styles.linePointEntry,
                        !detailPointId && styles.linePointRow,
                        editing && removable && styles.subPositionEntryEditing
                    )}
                >
                    {editing && removable && (
                        <button
                            type="button"
                            className={styles.deleteButton}
                            disabled={disabled}
                            aria-label="Remove point"
                            onClick={() => {
                                if (
                                    point.kind === 'branchpoint' &&
                                    onDeleteBranchPoint
                                ) {
                                    onDeleteBranchPoint(point.id)
                                    return
                                }
                                onChange({
                                    ...owner,
                                    points: owner.points.filter(
                                        ({ id }) => id !== point.id
                                    ),
                                })
                            }}
                        >
                            −
                        </button>
                    )}
                    <div
                        className={cn(
                            styles.subPositionEntryText,
                            styles.linePointText
                        )}
                    >
                        <span className={styles.linePointLabel}>
                            <span className={styles.linePointTypeIcon}>
                                {!(editing && removable) && (
                                    <span
                                        role="img"
                                        aria-label={pointType}
                                        title={pointType}
                                    >
                                        <PointIcon aria-hidden="true" />
                                    </span>
                                )}
                            </span>
                            <span>Point {index + 1}</span>
                        </span>
                        <div className={styles.linePointValues}>
                            <span className={styles.linePointCoordinates}>
                                {(['x', 'y'] as const).map((axis) => (
                                    <span
                                        key={axis}
                                        aria-label={axis.toUpperCase()}
                                    >
                                        {axis.toUpperCase()}:{' '}
                                        {coordinates &&
                                        Number.isFinite(coordinates[axis])
                                            ? Math.round(coordinates[axis])
                                            : free
                                              ? 'Invalid'
                                              : 'Measuring...'}
                                    </span>
                                ))}
                            </span>
                            {!detailPointId && (
                                <button
                                    type="button"
                                    className={styles.linePointOpen}
                                    aria-label={`View ${title}`}
                                    onClick={() => setSelectedPointId(point.id)}
                                >
                                    <FiChevronRight aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
        })
    const renderedBranches = new Set(chain.map(({ id }) => id))
    const renderBranches = (parent: Line, offset: number): ReactNode =>
        childLines(parent, lines)
            .filter((child) => !renderedBranches.has(child.id))
            .map((child) => {
                renderedBranches.add(child.id)
                const entries = child.points
                    .slice(1)
                    .map((point) => ({ point, owner: child }))
                return (
                    <Fragment key={child.id}>
                        {renderPoints(entries, offset)}
                        {renderBranches(child, offset + entries.length)}
                    </Fragment>
                )
            })
    return (
        <section
            aria-label={detailPointId ? 'Point details' : 'Line details'}
            className={styles.lineDetails}
        >
            {detailPointId && (
                <BackButton
                    label="Back to line"
                    onClick={() => setSelectedPointId(null)}
                />
            )}
            <FormGroup title="Details">
                {selectedPoint && (
                    <div
                        className={cn(
                            styles.subPositionsContainer,
                            styles.detailsFields
                        )}
                    >
                        <div>
                            <span>Type</span>
                            {editing &&
                            selectedPoint.kind !== 'anchorpoint' &&
                            !usedBranchPoints?.has(selectedPoint.id) ? (
                                <select
                                    aria-label="Point type"
                                    value={selectedPoint.kind}
                                    disabled={typeLocked}
                                    className={formFieldStyles.textField}
                                    onChange={(event) =>
                                        changePointType(
                                            event.target.value as
                                                'waypoint' | 'branchpoint'
                                        )
                                    }
                                >
                                    <option value="waypoint">Waypoint</option>
                                    <option value="branchpoint">
                                        Branchpoint
                                    </option>
                                </select>
                            ) : (
                                <div className={formFieldStyles.readonly}>
                                    {typeLabel}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className={styles.subPositions}>
                    <h3 className={styles.relationshipSectionTitle}>
                        {detailPointId ? 'Point' : 'Line points'}
                    </h3>
                    <div className={styles.subPositionsContainer}>
                        {renderPoints(points, 0)}
                        {renderBranches(line, points.length)}
                        {editing && !detailPointId && (
                            <button
                                type="button"
                                className={styles.addRow}
                                aria-label="Add point"
                                disabled={disabled}
                                onClick={onAddPoint}
                            >
                                <span className={styles.addIcon}>+</span>
                                Add point
                            </button>
                        )}
                    </div>
                </div>
            </FormGroup>
            {error && <p role="alert">{error}</p>}
            {editing && !detailPointId && (
                <button
                    type="button"
                    className={styles.lineDelete}
                    disabled={disabled}
                    onClick={onDelete}
                >
                    Delete line
                </button>
            )}
        </section>
    )
}
