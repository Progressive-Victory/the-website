import { validateChartDocument } from '../storage/chart.validation'
import {
    ORG_CHART_VERSION,
    PositionTypes,
    type ChartDocument,
    type Line,
    type Position,
    type BranchPoint,
} from './chart.types'
import { usedBranchPoints } from './lineGraph'
import { simplifyLines } from './lineOperations'
import type { Position as ApiPosition } from 'pv-contracts/data'

function addCoordinates(
    first: Position['coordinates'],
    second: Position['coordinates']
): Position['coordinates'] {
    if (!first && !second) return undefined
    return {
        x: (first?.x ?? 0) + (second?.x ?? 0),
        y: (first?.y ?? 0) + (second?.y ?? 0),
    }
}

export function removeDeletedPositionsAndUngroup(
    positions: Position[],
    deletedIds: ReadonlySet<number>
): Position[] {
    const positionsById = new Map(
        positions.map((position) => [position.id, position])
    )
    return [...positionsById.values()]
        .filter(({ id }) => !deletedIds.has(id))
        .map((position) => {
            const parentId = position.parentGroupId
            if (parentId === undefined) return position

            const parent = positionsById.get(parentId)
            if (
                parent?.type === PositionTypes.GROUP &&
                !deletedIds.has(parentId)
            )
                return position

            let coordinates = position.coordinates
            let ancestorId: number | undefined = parentId
            const visited = new Set<number>()
            while (ancestorId !== undefined && !visited.has(ancestorId)) {
                visited.add(ancestorId)
                const ancestor = positionsById.get(ancestorId)
                if (!ancestor) break
                if (
                    ancestor.type === PositionTypes.GROUP &&
                    !deletedIds.has(ancestorId)
                )
                    break
                coordinates = addCoordinates(coordinates, ancestor.coordinates)
                ancestorId = ancestor.parentGroupId
            }
            return { ...position, parentGroupId: undefined, coordinates }
        })
}

export function mergeChartWithPositions(
    chart: ChartDocument,
    positions: ApiPosition[]
): ChartDocument {
    const layouts = new Map(
        chart.positions.map((layout) => [layout.id, layout])
    )
    const merged = removeDeletedPositionsAndUngroup(
        positions.map(({ id, name, type, seats, userIds, permissions }) => {
            const layout = layouts.get(id)
            return {
                id,
                name,
                type,
                seats,
                userIds,
                permissions,
                ...(layout?.coordinates && { coordinates: layout.coordinates }),
                ...(layout?.parentGroupId !== undefined && {
                    parentGroupId: layout.parentGroupId,
                }),
                ...(layout?.groupBounds && { groupBounds: layout.groupBounds }),
            }
        }),
        new Set()
    )
    const lines = simplifyLines(
        chart.lines,
        new Set(merged.map(({ id }) => id)),
        chart.branchPoints
    )
    return {
        version: chart.version,
        positions: merged,
        lines,
        branchPoints: usedBranchPoints(lines, chart.branchPoints),
    }
}

export function applyChartDrafts(
    document: ChartDocument,
    drafts: Position[],
    deletedIds: ReadonlySet<number>,
    createdIds: ReadonlyMap<number, number>,
    lines: Line[],
    branchPoints: BranchPoint[]
): ChartDocument {
    const current = validateChartDocument(document)
    const allPositions = removeDeletedPositionsAndUngroup(
        [...current.positions, ...drafts],
        deletedIds
    )
    const savedPositions = allPositions.map((position) => ({
        ...position,
        id: createdIds.get(position.id) ?? position.id,
        parentGroupId:
            position.parentGroupId === undefined
                ? undefined
                : (createdIds.get(position.parentGroupId) ??
                  position.parentGroupId),
    }))
    const savedLines = simplifyLines(
        lines,
        new Set(allPositions.map(({ id }) => id)),
        branchPoints
    ).map((line) => ({
        ...line,
        points: line.points.map((point) =>
            point.kind === 'anchorpoint'
                ? {
                      ...point,
                      positionId:
                          createdIds.get(point.positionId) ?? point.positionId,
                  }
                : point
        ),
    }))

    return validateChartDocument({
        version: ORG_CHART_VERSION,
        positions: savedPositions,
        lines: savedLines,
        branchPoints: usedBranchPoints(savedLines, branchPoints),
    })
}
