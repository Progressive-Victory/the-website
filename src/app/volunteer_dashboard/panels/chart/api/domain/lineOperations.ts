import type {
    HandleSide,
    AnchorPoint,
    BranchPoint,
    BranchPointReference,
    Line,
} from './chart.types'
import { incomingLineCount, hasLineCycle, usedBranchPoints } from './lineGraph'

export function createLine(
    source: { positionId: number; handle: HandleSide },
    target: { positionId: number; handle: HandleSide }
): Line {
    return {
        id: crypto.randomUUID(),
        points: [
            {
                id: crypto.randomUUID(),
                kind: 'anchorpoint',
                ...source,
            },
            {
                id: crypto.randomUUID(),
                kind: 'anchorpoint',
                ...target,
            },
        ],
    }
}

export function createBranchLine(
    pointId: string,
    target: { positionId: number; handle: HandleSide }
): Line {
    return {
        id: crypto.randomUUID(),
        points: [
            {
                id: pointId,
                kind: 'branchpoint',
            },
            { id: crypto.randomUUID(), kind: 'anchorpoint', ...target },
        ],
    }
}

export function pruneDetachedLines(
    lines: Line[],
    positionIds: ReadonlySet<number>
): Line[] {
    let remaining = lines.filter((line) =>
        line.points.every(
            (point) =>
                point.kind !== 'anchorpoint' ||
                positionIds.has(point.positionId)
        )
    )
    while (true) {
        const next = remaining.filter((line) => {
            const source = line.points[0]
            return (
                source?.kind !== 'branchpoint' ||
                remaining.some(
                    (parent) =>
                        parent.points.some(
                            (point) =>
                                point.id === source.id &&
                                point.kind === 'branchpoint'
                        ) && parent.points[0]?.id !== source.id
                )
            )
        })
        if (next.length === remaining.length) return next
        remaining = next
    }
}

export function splitBranch(
    lines: Line[],
    lineId: string,
    pointId: string,
    target: { positionId: number; handle: HandleSide }
): { lines: Line[]; child: Line } {
    const split = splitAtJunction(lines, lineId, pointId)
    const child = createBranchLine(pointId, target)
    return { lines: [...split, child], child }
}

export function mergeBranch(
    lines: Line[],
    lineId: string,
    pointId: string,
    targetPointId: string
): { lines: Line[]; child: Line } {
    if (pointId === targetPointId)
        throw new Error('A branchpoint cannot connect to itself.')
    let next = splitAtJunction(lines, lineId, pointId)
    const owner = next.find((line) =>
        line.points
            .slice(1)
            .some(
                (point) =>
                    point.kind === 'branchpoint' && point.id === targetPointId
            )
    )
    if (!owner) throw new Error('The target branchpoint is not available.')
    next = splitAtJunction(next, owner.id, targetPointId)
    if (
        next.some(
            (line) =>
                line.points.length === 2 &&
                line.points[0].id === pointId &&
                line.points[1].id === targetPointId
        )
    )
        throw new Error('These branchpoints are already connected.')
    const child: Line = {
        id: crypto.randomUUID(),
        points: [
            { id: pointId, kind: 'branchpoint' },
            { id: targetPointId, kind: 'branchpoint' },
        ],
    }
    next = [...next, child]
    if (hasLineCycle(next))
        throw new Error('Connecting these branchpoints would create a loop.')
    return { lines: next, child }
}

function splitAtJunction(
    lines: Line[],
    lineId: string,
    pointId: string
): Line[] {
    const parent = lines.find((line) => line.id === lineId)
    const index =
        parent?.points.findIndex(
            (point) => point.id === pointId && point.kind === 'branchpoint'
        ) ?? -1
    if (!parent || index < 1)
        throw new Error('The branchpoint is not available.')
    if (index === parent.points.length - 1) return lines
    const continuation: Line = {
        id: crypto.randomUUID(),
        points: [
            {
                id: pointId,
                kind: 'branchpoint',
            },
            ...parent.points.slice(index + 1),
        ],
    }
    return [
        ...lines.map((line) => {
            if (line.id === lineId)
                return { ...line, points: line.points.slice(0, index + 1) }
            return line
        }),
        continuation,
    ]
}

export function upgradeBranchLines(lines: Line[]): Line[] {
    let result = lines
    for (const line of lines) {
        const source = line.points[0]
        if (source?.kind !== 'branchpoint') continue
        const parent = result.find((item) =>
            item.points.some(
                (point, index) =>
                    point.id === source.id &&
                    index > 0 &&
                    index < item.points.length - 1
            )
        )
        if (parent) result = splitAtJunction(result, parent.id, source.id)
    }
    return result
}

export function simplifyLines(
    lines: Line[],
    positionIds: ReadonlySet<number>,
    branchPoints: BranchPoint[]
): Line[] {
    let remaining = pruneDetachedLines(lines, positionIds)
    while (true) {
        const incoming = remaining.find((line) => {
            const end = line.points.at(-1)
            if (end?.kind !== 'branchpoint') return false
            const outgoing = remaining.filter((child) => {
                const start = child.points[0]
                return start?.kind === 'branchpoint' && start.id === end.id
            }).length
            return (
                outgoing === 0 ||
                (outgoing === 1 && incomingLineCount(end.id, remaining) === 1)
            )
        })
        if (!incoming) return remaining
        const junction = incoming.points.at(-1)!
        if (junction.kind !== 'branchpoint')
            throw new Error('Expected junction')
        const outgoing = remaining.find((line) => {
            const start = line.points[0]
            return start?.kind === 'branchpoint' && start.id === junction.id
        })
        if (!outgoing) {
            remaining = pruneDetachedLines(
                remaining.filter((line) => line.id !== incoming.id),
                positionIds
            )
            continue
        }
        const branch = branchPoints.find((point) => point.id === junction.id)
        if (!branch) throw new Error(`Unknown branchpoint ${junction.id}`)
        const merged: Line = {
            ...incoming,
            points: [
                ...incoming.points.slice(0, -1),
                {
                    ...junction,
                    kind: 'waypoint',
                    coordinates: branch.coordinates,
                },
                ...outgoing.points.slice(1),
            ],
        }
        remaining = remaining
            .filter((line) => line.id !== outgoing.id)
            .map((line) => {
                if (line.id === incoming.id) return merged
                return line
            })
    }
}

export function deleteBranch(
    lines: Line[],
    id: string,
    positionIds: ReadonlySet<number>,
    branchPoints: BranchPoint[]
): Line[] {
    return simplifyLines(
        pruneDetachedLines(
            lines.filter((line) => line.id !== id),
            positionIds
        ),
        positionIds,
        branchPoints
    )
}

export function deleteBranchPoint(
    lines: Line[],
    branchPoints: BranchPoint[],
    pointId: string,
    positionIds: ReadonlySet<number>,
    targetPointId?: string
): { lines: Line[]; branchPoints: BranchPoint[] } {
    const incoming = lines.find((line) =>
        line.points
            .slice(1)
            .some(
                (point) => point.kind === 'branchpoint' && point.id === pointId
            )
    )
    if (!incoming || !branchPoints.some(({ id }) => id === pointId))
        throw new Error(`Unknown branchpoint ${pointId}`)
    if (incomingLineCount(pointId, lines) > 1)
        throw new Error(
            'Merged branchpoints cannot be removed. Remove one incoming line first.'
        )
    const index = incoming.points.findIndex(({ id }) => id === pointId)
    const upstream = incoming.points[index - 1]
    const outgoing = lines.filter(
        (line) =>
            line.points[0]?.kind === 'branchpoint' &&
            line.points[0].id === pointId
    )
    if (outgoing.length > 0 && targetPointId && targetPointId !== upstream.id) {
        const downstream = outgoing.find(
            (line) => line.points[1]?.id === targetPointId
        )
        const target = downstream?.points[1]
        if (!downstream || !target)
            throw new Error('The merge target must be an adjacent point.')
        const origin: AnchorPoint | BranchPointReference =
            target.kind === 'anchorpoint'
                ? target
                : { id: target.id, kind: 'branchpoint' }
        const nextBranches = [
            ...branchPoints.filter(({ id }) => id !== pointId),
            ...(target.kind === 'waypoint'
                ? [{ id: target.id, coordinates: target.coordinates }]
                : []),
        ]
        const outgoingIds = new Set(outgoing.map(({ id }) => id))
        const nextLines = lines.flatMap((line): Line[] => {
            if (line.id === incoming.id)
                return [
                    { ...line, points: [...line.points.slice(0, -1), origin] },
                ]
            if (line.id === downstream.id) {
                if (target.kind !== 'waypoint') return []
                return [{ ...line, points: [origin, ...line.points.slice(2)] }]
            }
            if (!outgoingIds.has(line.id)) return [line]
            return [
                {
                    ...line,
                    points: [
                        origin.kind === 'anchorpoint'
                            ? { ...origin, id: crypto.randomUUID() }
                            : origin,
                        ...line.points.slice(1),
                    ],
                },
            ]
        })
        const simplified = simplifyLines(nextLines, positionIds, nextBranches)
        return {
            lines: simplified,
            branchPoints: usedBranchPoints(simplified, nextBranches),
        }
    }
    let nextBranches = branchPoints.filter(({ id }) => id !== pointId)
    let nextLines: Line[]
    if (outgoing.length === 0) {
        nextLines = lines.map((line) =>
            line.id === incoming.id
                ? {
                      ...line,
                      points: line.points.filter(({ id }) => id !== pointId),
                  }
                : line
        )
    } else {
        if (upstream.kind === 'waypoint')
            nextBranches = [
                ...nextBranches,
                { id: upstream.id, coordinates: upstream.coordinates },
            ]
        const origin: AnchorPoint | BranchPointReference =
            upstream.kind === 'anchorpoint'
                ? upstream
                : { id: upstream.id, kind: 'branchpoint' }
        const outgoingIds = new Set(outgoing.map(({ id }) => id))
        nextLines = lines.flatMap((line): Line[] => {
            if (line.id === incoming.id)
                return index === 1
                    ? []
                    : [
                          {
                              ...line,
                              points: [
                                  ...line.points.slice(0, index - 1),
                                  origin,
                              ],
                          },
                      ]
            if (!outgoingIds.has(line.id)) return [line]
            return [
                {
                    ...line,
                    points: [
                        origin.kind === 'anchorpoint'
                            ? { ...origin, id: crypto.randomUUID() }
                            : origin,
                        ...line.points.slice(1),
                    ],
                },
            ]
        })
    }
    const simplified = simplifyLines(nextLines, positionIds, nextBranches)
    return {
        lines: simplified,
        branchPoints: usedBranchPoints(simplified, nextBranches),
    }
}
