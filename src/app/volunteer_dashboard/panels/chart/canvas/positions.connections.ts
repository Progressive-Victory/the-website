import { PositionTypes, type Position } from '../domain/chart.types'

export { createLine } from '../domain/lineOperations'

export function canConnectPositions(
    positions: Position[],
    sourceId: number,
    targetId: number
): boolean {
    return (
        sourceId !== targetId &&
        positions.some(({ id }) => id === sourceId) &&
        positions.some(({ id }) => id === targetId)
    )
}

export function canSetParentGroup(
    positions: Position[],
    positionId: number,
    parentGroupId: number | undefined
): boolean {
    const positionById = new Map(
        positions.map((position) => [position.id, position])
    )
    if (!positionById.has(positionId)) return false
    if (parentGroupId === undefined) return true
    const parent = positionById.get(parentGroupId)
    if (parent?.type !== PositionTypes.GROUP || parentGroupId === positionId)
        return false

    const visited = new Set<number>()
    let ancestorId: number | undefined = parentGroupId
    while (ancestorId !== undefined) {
        if (ancestorId === positionId || visited.has(ancestorId)) return false
        visited.add(ancestorId)
        ancestorId = positionById.get(ancestorId)?.parentGroupId
    }
    return true
}
