import { validateChartDocument } from '../storage/chart.validation'
import {
    PositionTypes,
    type ChartDocument,
    type Line,
    type Position,
    type BranchPoint,
} from './chart.types'
import { usedBranchPoints } from './lineGraph'
import { simplifyLines } from './lineOperations'

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

export function saveLocalChart(
    document: ChartDocument,
    drafts: Position[],
    deletedIds: ReadonlySet<number>,
    lines: Line[],
    branchPoints: BranchPoint[] = document.branchPoints
): { document: ChartDocument; createdIds: Map<number, number> } {
    const current = validateChartDocument(document)
    let nextId = Math.max(0, ...current.positions.map(({ id }) => id)) + 1
    const createdIds = new Map(
        drafts
            .filter(({ id }) => id < 0 && !deletedIds.has(id))
            .map(({ id }) => [id, nextId++])
    )
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

    const savedDocument = validateChartDocument({
        version: 5,
        positions: savedPositions,
        lines: savedLines,
        branchPoints: usedBranchPoints(savedLines, branchPoints),
    })
    return { document: savedDocument, createdIds }
}
