import { type ChartDocument, type Position } from '../domain/chart.types'
import { usedBranchPoints } from '../domain/lineGraph'
import { simplifyLines } from '../domain/lineOperations'

export type ChartClipboard = Omit<ChartDocument, 'version'>

export function pastedSelectionIds(pasted: ChartClipboard): string[] {
    return [
        ...pasted.positions.map(({ id }) => String(id)),
        ...pasted.lines.flatMap(({ points }) =>
            points.flatMap((point) =>
                point.kind === 'waypoint' ? [`linepoint:${point.id}`] : []
            )
        ),
        ...pasted.branchPoints.map(({ id }) => `linepoint:${id}`),
    ]
}

export function copyChartSelection(
    chart: ChartClipboard,
    selectedIds: ReadonlySet<number>
): ChartClipboard {
    const ids = new Set(selectedIds)
    let size: number
    do {
        size = ids.size
        for (const position of chart.positions)
            if (
                position.parentGroupId !== undefined &&
                ids.has(position.parentGroupId)
            )
                ids.add(position.id)
    } while (ids.size !== size)

    const byId = new Map(
        chart.positions.map((position) => [position.id, position])
    )
    const positions = chart.positions
        .filter(({ id }) => ids.has(id))
        .map((position) => {
            if (
                position.parentGroupId === undefined ||
                ids.has(position.parentGroupId)
            )
                return position

            let x = position.coordinates?.x ?? 0
            let y = position.coordinates?.y ?? 0
            let parentId: number | undefined = position.parentGroupId
            const visited = new Set([position.id])
            while (parentId !== undefined) {
                if (visited.has(parentId))
                    throw new Error('Cannot copy cyclic group membership.')
                visited.add(parentId)
                const parent = byId.get(parentId)
                if (!parent)
                    throw new Error(
                        'Cannot copy a member with a missing parent.'
                    )
                x += parent.coordinates?.x ?? 0
                y += parent.coordinates?.y ?? 0
                parentId = parent.parentGroupId
            }
            return {
                ...position,
                parentGroupId: undefined,
                coordinates: { x, y },
            }
        })
    const lines = simplifyLines(chart.lines, ids, chart.branchPoints)
    return structuredClone({
        positions,
        lines,
        branchPoints: usedBranchPoints(lines, chart.branchPoints),
    })
}

export function pasteChartSelection(
    clipboard: ChartClipboard,
    at: { x: number; y: number },
    nextPositionId: () => number
): ChartClipboard {
    if (!clipboard.positions.length)
        throw new Error('The chart clipboard is empty.')
    const roots = clipboard.positions.filter(
        ({ parentGroupId }) => parentGroupId === undefined
    )
    if (!roots.length)
        throw new Error('The chart clipboard has no root positions.')
    const offset = {
        x:
            at.x -
            Math.min(
                ...roots.map(
                    (position) =>
                        (position.coordinates?.x ?? 0) +
                        (position.groupBounds?.x ?? 0)
                )
            ),
        y:
            at.y -
            Math.min(
                ...roots.map(
                    (position) =>
                        (position.coordinates?.y ?? 0) +
                        (position.groupBounds?.y ?? 0)
                )
            ),
    }
    const positionIds = new Map(
        clipboard.positions.map(({ id }) => [id, nextPositionId()])
    )
    const pointIds = new Map<string, string>()
    const pointId = (id: string) => {
        let result = pointIds.get(id)
        if (!result) {
            result = crypto.randomUUID()
            pointIds.set(id, result)
        }
        return result
    }
    const translate = ({ x, y }: { x: number; y: number }) => ({
        x: x + offset.x,
        y: y + offset.y,
    })
    const positions: Position[] = clipboard.positions.map((position) => ({
        ...structuredClone(position),
        id: positionIds.get(position.id)!,
        parentGroupId:
            position.parentGroupId === undefined
                ? undefined
                : positionIds.get(position.parentGroupId)!,
        coordinates:
            position.parentGroupId === undefined
                ? translate(position.coordinates ?? { x: 0, y: 0 })
                : position.coordinates && { ...position.coordinates },
    }))
    return {
        positions,
        lines: clipboard.lines.map((line) => ({
            id: crypto.randomUUID(),
            points: line.points.map((point) => {
                const id = pointId(point.id)
                if (point.kind === 'anchorpoint')
                    return {
                        ...point,
                        id,
                        positionId: positionIds.get(point.positionId)!,
                    }
                if (point.kind === 'waypoint')
                    return {
                        ...point,
                        id,
                        coordinates: translate(point.coordinates),
                    }
                return { ...point, id }
            }),
        })),
        branchPoints: clipboard.branchPoints.map((point) => ({
            id: pointId(point.id),
            coordinates: translate(point.coordinates),
        })),
    }
}
