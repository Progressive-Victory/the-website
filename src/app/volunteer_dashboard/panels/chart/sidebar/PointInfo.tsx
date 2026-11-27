import {
    PositionTypes,
    type BranchPoint,
    type Line,
    type LinePointData,
    type Position,
} from '../api/domain/chart.types'
import { groupOriginOf } from '../api/domain/chartDocument.operations'
import type { LinePointCoordinates } from '../canvas/LineEditingContext'
import { DropdownRow, ListRow } from '@/components/common/list'

type Coordinates = { x: number; y: number } | undefined

const formatCoordinates = (coordinates: Coordinates) =>
    coordinates &&
    Number.isFinite(coordinates.x) &&
    Number.isFinite(coordinates.y)
        ? `${Math.round(coordinates.x)}, ${Math.round(coordinates.y)}`
        : 'Measuring…'

export function pointGroupId(
    point: LinePointData,
    branchPoints: BranchPoint[]
): number | undefined {
    if (point.kind === 'waypoint') return point.parentGroupId
    if (point.kind === 'branchpoint')
        return branchPoints.find(({ id }) => id === point.id)?.parentGroupId
    return undefined
}

function pointCanvasCoordinates(
    point: LinePointData,
    branchPoints: BranchPoint[],
    pointCoordinates: LinePointCoordinates
): Coordinates {
    if (point.kind === 'waypoint') return point.coordinates
    if (point.kind === 'branchpoint')
        return branchPoints.find(({ id }) => id === point.id)?.coordinates
    return pointCoordinates[point.id]
}

export function PointInfo({
    point,
    lines,
    positions,
    branchPoints,
    pointCoordinates,
    editing,
    disabled,
    onChangeGroup,
}: {
    point: LinePointData
    lines: Line[]
    positions: Position[]
    branchPoints: BranchPoint[]
    pointCoordinates: LinePointCoordinates
    editing: boolean
    disabled: boolean
    onChangeGroup?: (pointId: string, parentGroupId: number | undefined) => void
}) {
    const canvas = pointCanvasCoordinates(point, branchPoints, pointCoordinates)
    const groupId = pointGroupId(point, branchPoints)
    const group = positions.find(({ id }) => id === groupId)
    const origin =
        groupId === undefined ? undefined : groupOriginOf(positions)(groupId)
    const local = canvas &&
        origin && { x: canvas.x - origin.x, y: canvas.y - origin.y }
    const lineCount = lines.filter((line) =>
        line.points.some(({ id }) => id === point.id)
    ).length
    const groupOptions = [
        { value: '', label: 'Canvas' },
        ...positions
            .filter(({ type }) => type === PositionTypes.GROUP)
            .map(({ id, name }) => ({ value: id, label: name })),
    ]

    const renderGroup = () => {
        if (point.kind === 'anchorpoint') {
            const anchor = positions.find(({ id }) => id === point.positionId)
            return <ListRow label="Attached to" value={anchor?.name} />
        }
        if (!editing)
            return <ListRow label="Group" value={group?.name ?? 'Canvas'} />
        return (
            <DropdownRow
                label="Group"
                editing
                readOnly={disabled}
                value={groupId ?? ''}
                options={groupOptions}
                onValueChange={(value) =>
                    onChangeGroup?.(
                        point.id,
                        value === '' ? undefined : Number(value)
                    )
                }
            />
        )
    }

    return (
        <>
            {renderGroup()}
            <ListRow
                label="Canvas position"
                value={formatCoordinates(canvas)}
            />
            {local && (
                <ListRow
                    label="Group position"
                    sublabel={`Relative to ${group?.name ?? 'group'}`}
                    value={formatCoordinates(local)}
                />
            )}
            <ListRow label="Lines" value={lineCount} />
        </>
    )
}
