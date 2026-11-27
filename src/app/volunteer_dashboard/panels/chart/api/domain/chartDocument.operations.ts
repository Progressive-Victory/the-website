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

export function reparentPosition(
    positions: Position[],
    form: Position,
    parentGroupId: number | undefined
): Position {
    const absoluteOrigin = (id: number | undefined) => {
        let x = 0
        let y = 0
        const visited = new Set<number>()
        while (id !== undefined && !visited.has(id)) {
            visited.add(id)
            const group = positions.find((item) => item.id === id)
            x += group?.coordinates?.x ?? 0
            y += group?.coordinates?.y ?? 0
            id = group?.parentGroupId
        }
        return { x, y }
    }
    const before = absoluteOrigin(form.parentGroupId)
    const after = absoluteOrigin(parentGroupId)
    const coordinates =
        positions.find(({ id }) => id === form.id)?.coordinates ??
        form.coordinates
    return {
        ...form,
        parentGroupId,
        coordinates: {
            x: (coordinates?.x ?? 0) + before.x - after.x,
            y: (coordinates?.y ?? 0) + before.y - after.y,
        },
    }
}

export function apiParentGroupIds(
    positions: ApiPosition[]
): Map<number, number> {
    const parents = new Map<number, number>()
    const createsCycle = (childId: number, groupId: number) => {
        const visited = new Set<number>()
        for (
            let id: number | undefined = groupId;
            id !== undefined && !visited.has(id);
            id = parents.get(id)
        ) {
            if (id === childId) return true
            visited.add(id)
        }
        return false
    }
    for (const group of positions) {
        if (group.type !== PositionTypes.GROUP) continue
        for (const { id } of group.childRelationships) {
            if (parents.has(id) || createsCycle(id, group.id)) continue
            parents.set(id, group.id)
        }
    }
    return parents
}

export function mergeChartWithPositions(
    chart: ChartDocument,
    positions: ApiPosition[]
): ChartDocument {
    const layouts = new Map(
        chart.positions.map((layout) => [layout.id, layout])
    )
    let withLayout: Position[] = positions.map(
        ({ id, name, type, seats, userIds, permissions }) => {
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
        }
    )
    const parents = apiParentGroupIds(positions)
    for (const { id } of positions) {
        const position = withLayout.find((item) => item.id === id)!
        const parentGroupId = parents.get(id)
        if (position.parentGroupId === parentGroupId) continue
        const moved = reparentPosition(withLayout, position, parentGroupId)
        withLayout = withLayout.map((item) => (item.id === id ? moved : item))
    }
    const merged = removeDeletedPositionsAndUngroup(withLayout, new Set())
    const groupIds = new Set(
        merged
            .filter(({ type }) => type === PositionTypes.GROUP)
            .map(({ id }) => id)
    )
    const onCanvas = shiftPointPlanes(
        chart.lines,
        chart.branchPoints,
        groupOriginOf(chart.positions),
        1
    )
    const planes = shiftPointPlanes(
        onCanvas.lines,
        onCanvas.branchPoints,
        (id) => (groupIds.has(id) ? { x: 0, y: 0 } : undefined),
        1
    )
    const lines = simplifyLines(
        planes.lines,
        new Set(merged.map(({ id }) => id)),
        planes.branchPoints
    )
    return {
        version: chart.version,
        positions: merged,
        lines,
        branchPoints: usedBranchPoints(lines, planes.branchPoints),
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
    const mapGroup = <T extends { parentGroupId?: number }>(point: T): T =>
        point.parentGroupId === undefined
            ? point
            : {
                  ...point,
                  parentGroupId:
                      createdIds.get(point.parentGroupId) ??
                      point.parentGroupId,
              }
    const savedLines = simplifyLines(
        lines,
        new Set(allPositions.map(({ id }) => id)),
        branchPoints
    ).map((line) => ({
        ...line,
        points: line.points.map((point) => {
            if (point.kind === 'waypoint') return mapGroup(point)
            if (point.kind !== 'anchorpoint') return point
            return {
                ...point,
                positionId:
                    createdIds.get(point.positionId) ?? point.positionId,
            }
        }),
    }))
    const stored = shiftPointPlanes(
        savedLines,
        usedBranchPoints(savedLines, branchPoints).map(mapGroup),
        groupOriginOf(savedPositions),
        -1
    )

    return validateChartDocument({
        version: ORG_CHART_VERSION,
        positions: savedPositions,
        lines: stored.lines,
        branchPoints: stored.branchPoints,
    })
}

type GroupOrigin = (groupId: number) => { x: number; y: number } | undefined

// A group's plane starts at its coordinates point, offset by every ancestor group.
export function groupOriginOf(positions: Position[]): GroupOrigin {
    const byId = new Map(positions.map((position) => [position.id, position]))
    return (groupId) => {
        if (byId.get(groupId)?.type !== PositionTypes.GROUP) return undefined
        let x = 0
        let y = 0
        const visited = new Set<number>()
        let id: number | undefined = groupId
        while (id !== undefined && !visited.has(id)) {
            visited.add(id)
            const group = byId.get(id)
            x += group?.coordinates?.x ?? 0
            y += group?.coordinates?.y ?? 0
            id = group?.parentGroupId
        }
        return { x, y }
    }
}

/** Moves grouped points between canvas (+1) and group-relative (-1) coordinates. */
export function shiftPointPlanes(
    lines: Line[],
    branchPoints: BranchPoint[],
    originOf: GroupOrigin,
    direction: 1 | -1
): { lines: Line[]; branchPoints: BranchPoint[] } {
    const shift = <
        T extends {
            coordinates: { x: number; y: number }
            parentGroupId?: number
        },
    >(
        point: T
    ): T => {
        if (point.parentGroupId === undefined) return point
        const origin = originOf(point.parentGroupId)
        if (!origin) return { ...point, parentGroupId: undefined }
        return {
            ...point,
            coordinates: {
                x: point.coordinates.x + direction * origin.x,
                y: point.coordinates.y + direction * origin.y,
            },
        }
    }
    return {
        lines: lines.map((line) => ({
            ...line,
            points: line.points.map((point) =>
                point.kind === 'waypoint' ? shift(point) : point
            ),
        })),
        branchPoints: branchPoints.map(shift),
    }
}
