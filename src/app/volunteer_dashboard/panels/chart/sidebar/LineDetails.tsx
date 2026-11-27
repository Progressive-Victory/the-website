import {
    type Line,
    type LinePointData,
    type BranchPoint,
    type Position,
} from '../api/domain/chart.types'
import {
    lineError,
    isMovablePoint,
    parentLines,
    resolveLineSources,
    childLines,
    incomingLineCount,
} from '../api/domain/lineGraph'
import { convertLinePoint } from '../api/domain/lineOperations'
import type { LinePointCoordinates } from '../canvas/LineEditingContext'
import styles from '../page.module.css'
import { PointInfo, pointGroupId } from './PointInfo'
import { BackButton } from '@/components/common/buttons'
import {
    AddListButton,
    AddListItem,
    DropdownRow,
    List,
    ListRow,
    NavigationRow,
} from '@/components/common/list'
import { Fragment, useState, type ReactNode } from 'react'
import { FaCodeCommit, FaCodeCompare, FaCodeMerge } from 'react-icons/fa6'
import { FiChevronRight } from 'react-icons/fi'

const pointTypeOptions = [
    { value: 'waypoint', label: 'Waypoint' },
    { value: 'branchpoint', label: 'Branchpoint' },
]

interface PointEntry {
    point: LinePointData
    owner: Line
}

interface FeedGroup {
    id: string
    title: string
    points: PointEntry[]
}

export function LineDetails({
    line,
    lines = [],
    positions = [],
    branchPoints = [],
    pointCoordinates,
    editing,
    disabled,
    onChange,
    onChangePointGroup,
    onDelete,
    onBack,
    onAddPoint,
    onDeleteBranchPoint,
    usedBranchPoints,
    selectedPointId: controlledPointId,
    onSelectPoint,
}: {
    line: Line
    lines?: Line[]
    positions?: Position[]
    branchPoints?: BranchPoint[]
    pointCoordinates: LinePointCoordinates
    editing: boolean
    disabled: boolean
    onChange: (line: Line, branchPoints?: BranchPoint[]) => void
    onChangePointGroup?: (
        pointId: string,
        parentGroupId: number | undefined
    ) => void
    onDelete: () => void
    onBack: () => void
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
        const result = convertLinePoint(
            owner,
            selectedPoint.id,
            kind,
            branchPoints
        )
        onChange(result.line, result.branchPoints)
    }
    const error = lineError(line)
    const visited = new Set<string>()
    const chainTo = (end: Line) => {
        const chain: Line[] = []
        let current: Line | undefined = end
        while (current && !visited.has(current.id)) {
            chain.unshift(current)
            visited.add(current.id)
            const parents = parentLines(current, lines)
            current = parents.length === 1 ? parents[0] : undefined
        }
        return chain
    }
    const chainPoints = (chain: Line[]): PointEntry[] =>
        chain.flatMap((owner, index) =>
            owner.points
                .slice(index === 0 ? 0 : 1)
                .map((point) => ({ point, owner }))
        )
    const chain = chainTo(line)
    const collectFeeds = (head: Line): FeedGroup[] => {
        const parents = parentLines(head, lines)
        if (parents.length < 2) return []
        return parents.flatMap((parent) => {
            if (visited.has(parent.id)) return []
            const feed = chainTo(parent)
            const sourceIds = new Set(
                resolveLineSources(parent, lines).map(
                    ({ positionId }) => positionId
                )
            )
            const names = positions
                .filter(({ id }) => sourceIds.has(id))
                .map(({ name }) => name)
            return [
                ...collectFeeds(feed[0]),
                {
                    id: parent.id,
                    title: `From ${names.join(', ') || 'unknown'}`,
                    points: chainPoints(feed),
                },
            ]
        })
    }
    const feeds = chain[0] ? collectFeeds(chain[0]) : []
    const points = chainPoints(chain)
    const detailFeedId = points.some(({ point }) => point.id === detailPointId)
        ? undefined
        : feeds.find(({ points }) =>
              points.some(({ point }) => point.id === detailPointId)
          )?.id
    const renderPoints = (entries: PointEntry[], offset: number) =>
        entries.map(({ point, owner }, localIndex) => {
            if (detailPointId && point.id !== detailPointId) return null
            const index = offset + localIndex
            const free = point.kind !== 'anchorpoint'
            const junction =
                point.id === owner.points.at(-1)?.id &&
                point.kind === 'branchpoint'
            const removable =
                free &&
                point.id !== owner.points[0]?.id &&
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
            const selectPoint = () => setSelectedPointId(point.id)
            const groupName = positions.find(
                ({ id }) => id === pointGroupId(point, branchPoints)
            )?.name
            const removePoint = () => {
                if (point.kind === 'branchpoint' && onDeleteBranchPoint) {
                    onDeleteBranchPoint(point.id)
                    return
                }
                onChange({
                    ...owner,
                    points: owner.points.filter(({ id }) => id !== point.id),
                })
            }
            const coordinatesLabel = (
                <span className={styles.linePointCoordinates}>
                    {(['x', 'y'] as const).map((axis) => (
                        <span key={axis} aria-label={axis.toUpperCase()}>
                            {axis.toUpperCase()}:{' '}
                            {coordinates && Number.isFinite(coordinates[axis])
                                ? Math.round(coordinates[axis])
                                : free
                                  ? 'Invalid'
                                  : 'Measuring...'}
                        </span>
                    ))}
                </span>
            )
            const pointLabel = (
                <span className={styles.linePointLabel}>
                    <span className={styles.linePointTypeIcon}>
                        <span
                            role="img"
                            aria-label={pointType}
                            title={pointType}
                        >
                            <PointIcon aria-hidden="true" />
                        </span>
                    </span>
                    <span>Point {index + 1}</span>
                </span>
            )
            if (editing && removable)
                return (
                    <AddListItem
                        key={point.id}
                        label={`Point ${index + 1}`}
                        removeLabel={title}
                        onRemove={removePoint}
                        accessory={
                            <>
                                {coordinatesLabel}
                                {!detailPointId && (
                                    <button
                                        type="button"
                                        className={styles.linePointOpen}
                                        aria-label={`View ${title}`}
                                        onClick={selectPoint}
                                    >
                                        <FiChevronRight aria-hidden="true" />
                                    </button>
                                )}
                            </>
                        }
                    />
                )
            if (detailPointId)
                return (
                    <ListRow
                        key={point.id}
                        label={pointLabel}
                        sublabel={groupName}
                        value={coordinatesLabel}
                    />
                )
            return (
                <NavigationRow
                    key={point.id}
                    label={pointLabel}
                    sublabel={groupName}
                    value={coordinatesLabel}
                    onClick={selectPoint}
                />
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
            {detailPointId ? (
                <BackButton
                    label="Back to line"
                    onClick={() => setSelectedPointId(null)}
                />
            ) : (
                <BackButton label="Back To Positions" onClick={onBack} />
            )}
            {selectedPoint && (
                <List title="Details">
                    {editing &&
                    selectedPoint.kind !== 'anchorpoint' &&
                    !usedBranchPoints?.has(selectedPoint.id) ? (
                        <DropdownRow
                            label="Type"
                            editing
                            readOnly={typeLocked}
                            value={selectedPoint.kind}
                            options={pointTypeOptions}
                            onValueChange={(value) =>
                                changePointType(
                                    value as 'waypoint' | 'branchpoint'
                                )
                            }
                        />
                    ) : (
                        <ListRow label="Type" value={typeLabel} />
                    )}
                    <PointInfo
                        point={selectedPoint}
                        lines={lines}
                        positions={positions}
                        branchPoints={branchPoints}
                        pointCoordinates={pointCoordinates}
                        editing={editing}
                        disabled={disabled}
                        onChangeGroup={onChangePointGroup}
                    />
                </List>
            )}
            {feeds
                .filter(({ id }) => !detailPointId || id === detailFeedId)
                .map((feed) => (
                    <List
                        key={feed.id}
                        title={detailPointId ? 'Point' : feed.title}
                        editing={editing}
                    >
                        {renderPoints(feed.points, 0)}
                    </List>
                ))}
            {!detailFeedId && (
                <List
                    title={detailPointId ? 'Point' : 'Line points'}
                    editing={editing}
                >
                    {renderPoints(points, 0)}
                    {renderBranches(line, points.length)}
                    {editing && !detailPointId && (
                        <AddListButton onClick={onAddPoint}>
                            Add point
                        </AddListButton>
                    )}
                </List>
            )}
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
