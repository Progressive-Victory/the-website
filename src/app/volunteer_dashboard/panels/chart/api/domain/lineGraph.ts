import type {
    AnchorPoint,
    Waypoint,
    BranchPoint,
    BranchPointReference,
    LinePointData,
    ResolvedBranchPoint,
    ResolvedLine,
    Line,
} from './chart.types'

export function resolveLinePoints(
    line: Line,
    branchPoints: BranchPoint[]
): ResolvedLine {
    const byId = new Map(branchPoints.map((point) => [point.id, point]))
    return {
        ...line,
        points: line.points.map((point) => {
            if (point.kind !== 'branchpoint') return point
            const branch = byId.get(point.id)
            if (!branch) throw new Error(`Unknown branchpoint ${point.id}`)
            return { ...point, coordinates: branch.coordinates }
        }),
    }
}

export function parentLine(line: Line, lines: Line[]): Line | undefined {
    const source = line.points[0]
    if (source?.kind !== 'branchpoint') return undefined
    return lines.find(
        (parent) =>
            parent.id !== line.id &&
            parent.points
                .slice(1)
                .some(
                    (point) =>
                        point.kind === 'branchpoint' && point.id === source.id
                )
    )
}

export function parentLines(line: Line, lines: Line[]): Line[] {
    const source = line.points[0]
    if (source?.kind !== 'branchpoint') return []
    return lines.filter(
        (parent) =>
            parent.id !== line.id &&
            parent.points
                .slice(1)
                .some(
                    (point) =>
                        point.kind === 'branchpoint' && point.id === source.id
                )
    )
}

export function incomingLineCount(pointId: string, lines: Line[]): number {
    return lines.filter((line) =>
        line.points
            .slice(1)
            .some(
                (point) => point.kind === 'branchpoint' && point.id === pointId
            )
    ).length
}

export function hasLineCycle(lines: Line[]): boolean {
    const state = new Map<string, 'visiting' | 'done'>()
    const visit = (line: Line): boolean => {
        const current = state.get(line.id)
        if (current === 'visiting') return true
        if (current === 'done') return false
        state.set(line.id, 'visiting')
        if (parentLines(line, lines).some(visit)) return true
        state.set(line.id, 'done')
        return false
    }
    return lines.some(visit)
}

export function resolveLineSources(line: Line, lines: Line[]): AnchorPoint[] {
    const sources = new Map<string, AnchorPoint>()
    const visited = new Set<string>()
    const pending = [line]
    while (pending.length) {
        const current = pending.pop()!
        if (visited.has(current.id)) continue
        visited.add(current.id)
        const source = current.points[0]
        if (source?.kind === 'anchorpoint') sources.set(source.id, source)
        else pending.push(...parentLines(current, lines))
    }
    return [...sources.values()]
}

export function exclusiveSourceLines(
    line: Line,
    lines: Line[],
    positionId: number
): string[] {
    const ids = new Set<string>()
    const visited = new Set<string>()
    const visit = (current: Line) => {
        if (visited.has(current.id)) return
        visited.add(current.id)
        const sources = resolveLineSources(current, lines)
        if (!sources.some((source) => source.positionId === positionId)) return
        if (sources.every((source) => source.positionId === positionId)) {
            ids.add(current.id)
            return
        }
        parentLines(current, lines).forEach(visit)
    }
    visit(line)
    return [...ids]
}

export function childLines(line: Line, lines: Line[]): Line[] {
    const target = line.points.at(-1)
    if (target?.kind !== 'branchpoint') return []
    return lines.filter(
        (child) =>
            child.points[0]?.kind === 'branchpoint' &&
            child.points[0].id === target.id
    )
}

export function usedBranchPoints(
    lines: Line[],
    branchPoints: BranchPoint[]
): BranchPoint[] {
    const ids = new Set(
        lines.flatMap((line) =>
            line.points
                .filter((point) => point.kind === 'branchpoint')
                .map(({ id }) => id)
        )
    )
    return branchPoints.filter(({ id }) => ids.has(id))
}

export function isMovablePoint(
    point: LinePointData | ResolvedBranchPoint
): point is Waypoint | ResolvedBranchPoint {
    return (
        point.kind === 'waypoint' ||
        (point.kind === 'branchpoint' && 'coordinates' in point)
    )
}

export function lineEndpoints(line: Line): {
    source: AnchorPoint | BranchPointReference
    target: AnchorPoint | BranchPointReference
} {
    const source = line.points[0]
    const target = line.points[line.points.length - 1]
    if (
        (source?.kind !== 'anchorpoint' && source?.kind !== 'branchpoint') ||
        (target?.kind !== 'anchorpoint' && target?.kind !== 'branchpoint')
    )
        throw new Error(`Line ${line.id} must have anchored endpoints`)
    return { source, target }
}

export function lineError(line: Line): string | null {
    if (typeof line.id !== 'string' || line.id.length === 0)
        return 'A line must have a nonempty id'
    if (line.points.length < 2) return 'A line must have at least two points'
    const pointIds = new Set<string>()
    for (const [index, point] of line.points.entries()) {
        if (!point.id) return `Point ${index} must have a nonempty id`
        if (pointIds.has(point.id)) return `Duplicate point id ${point.id}`
        pointIds.add(point.id)
        const isEndpoint = index === 0 || index === line.points.length - 1
        if (
            isEndpoint &&
            point.kind !== 'anchorpoint' &&
            !(
                index === line.points.length - 1 && point.kind === 'branchpoint'
            ) &&
            !(index === 0 && point.kind === 'branchpoint')
        )
            return 'Line endpoints must be anchorpoints'
        if (
            !isEndpoint &&
            point.kind !== 'waypoint' &&
            point.kind !== 'branchpoint'
        )
            return 'Only waypoints or branchpoints may be interior points'
        if (
            isMovablePoint(point) &&
            (!Number.isFinite(point.coordinates.x) ||
                !Number.isFinite(point.coordinates.y))
        )
            return `Point ${index} must have finite coordinates`
    }
    const { source, target } = lineEndpoints(line)
    if (
        source.kind === 'anchorpoint' &&
        target.kind === 'anchorpoint' &&
        source.positionId === target.positionId
    )
        return 'A line cannot connect a position to itself'
    return null
}

export function resolveLineSource(
    line: Line,
    lines: ReadonlyMap<string, Line>
): AnchorPoint | undefined {
    const visited = new Set<string>()
    let current: Line | undefined = line
    while (current && !visited.has(current.id)) {
        visited.add(current.id)
        const source: LinePointData | undefined = current.points[0]
        if (source?.kind === 'anchorpoint') return source
        if (source?.kind !== 'branchpoint') return undefined
        current = [...lines.values()].find(
            (parent) =>
                parent.id !== current?.id &&
                parent.points
                    .slice(1)
                    .some(
                        (point) =>
                            point.kind === 'branchpoint' &&
                            point.id === source.id
                    )
        )
    }
    return undefined
}

export function resolveLineTarget(
    line: Line,
    lines: Line[],
    visited = new Set<string>()
): AnchorPoint | undefined {
    if (visited.has(line.id)) return undefined
    visited.add(line.id)
    const target = line.points.at(-1)
    if (target?.kind === 'anchorpoint') return target
    for (const child of lines) {
        const start = child.points[0]
        if (
            start?.kind === 'branchpoint' &&
            target?.kind === 'branchpoint' &&
            start.id === target.id
        ) {
            const result = resolveLineTarget(child, lines, visited)
            if (result) return result
        }
    }
    return undefined
}
