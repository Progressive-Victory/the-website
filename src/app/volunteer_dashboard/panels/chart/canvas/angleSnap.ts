import type { HandleSide, Line, LinePointData } from '../api/domain/chart.types'

interface Point {
    x: number
    y: number
}

export interface AngleNeighbor extends Point {
    others: Point[]
    anchored: boolean
}

export interface AngleSector {
    start: number
    sweep: number
    snapped: boolean
    fromBaseline: boolean
}

export interface AngleVertex {
    center: Point
    sectors: AngleSector[]
}

export interface AngleGuideSet {
    vertices: AngleVertex[]
    snapLines: [Point, Point][]
}

const STEP = Math.PI / 4
const TAU = Math.PI * 2
const ON_LINE = 0.01

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const angleTo = (from: Point, to: Point) =>
    Math.atan2(to.y - from.y, to.x - from.x)
const normalize = (angle: number) => ((angle % TAU) + TAU) % TAU
const isStep = (angle: number) => {
    const steps = angle / STEP
    return Math.abs(steps - Math.round(steps)) < 1e-3
}

const snapDirections = ({ x, y, others }: AngleNeighbor) =>
    [0, ...others.map((other) => angleTo({ x, y }, other))].flatMap((base) =>
        [0, 1, 2, 3].map((step) => ({
            x: Math.cos(base + step * STEP),
            y: Math.sin(base + step * STEP),
        }))
    )

const offLine = (origin: Point, direction: Point, point: Point) =>
    Math.abs(
        (point.x - origin.x) * direction.y - (point.y - origin.y) * direction.x
    )

interface SnapLine {
    neighbor: number
    origin: Point
    direction: Point
}

const project = ({ origin, direction }: SnapLine, point: Point) => {
    const t =
        (point.x - origin.x) * direction.x + (point.y - origin.y) * direction.y
    return { x: origin.x + direction.x * t, y: origin.y + direction.y * t }
}

const intersect = (a: SnapLine, b: SnapLine) => {
    const cross = a.direction.x * b.direction.y - a.direction.y * b.direction.x
    if (Math.abs(cross) < 1e-9) return undefined
    const t =
        ((b.origin.x - a.origin.x) * b.direction.y -
            (b.origin.y - a.origin.y) * b.direction.x) /
        cross
    return {
        x: a.origin.x + a.direction.x * t,
        y: a.origin.y + a.direction.y * t,
    }
}

const isSnapped = (neighbor: AngleNeighbor, point: Point) =>
    distance(neighbor, point) >= 1 &&
    snapDirections(neighbor).some(
        (direction) => offLine(neighbor, direction, point) < ON_LINE
    )

export function snapToAngles(
    cursor: Point,
    neighbors: AngleNeighbor[],
    tolerance: number
): Point | undefined {
    const lines: SnapLine[] = neighbors.flatMap((origin, neighbor) =>
        distance(origin, cursor) < tolerance
            ? []
            : snapDirections(origin).flatMap((direction) =>
                  offLine(origin, direction, cursor) <= tolerance
                      ? [{ neighbor, origin, direction }]
                      : []
              )
    )
    const candidates = [
        ...lines.map((line) => project(line, cursor)),
        ...lines.flatMap((a, index) =>
            lines.slice(index + 1).flatMap((b) => {
                if (a.neighbor === b.neighbor) return []
                const corner = intersect(a, b)
                return corner && distance(corner, cursor) <= tolerance * 2
                    ? [corner]
                    : []
            })
        ),
    ]
    let best: { point: Point; score: number; away: number } | undefined
    for (const point of candidates) {
        const score = neighbors.filter((neighbor) =>
            isSnapped(neighbor, point)
        ).length
        const away = distance(point, cursor)
        if (
            !best ||
            score > best.score ||
            (score === best.score && away < best.away)
        )
            best = { point, score, away }
    }
    return best?.point
}

const sectorsAround = (
    center: Point,
    rays: Point[],
    focus?: number
): AngleSector[] => {
    if (rays.length === 1) {
        const sweep = angleTo(center, rays[0])
        return [{ start: 0, sweep, snapped: isStep(sweep), fromBaseline: true }]
    }
    const order = rays
        .map((ray, index) => ({
            angle: normalize(angleTo(center, ray)),
            index,
        }))
        .sort((a, b) => a.angle - b.angle)
    const sectors = order.flatMap((ray, position) => {
        const next = order[(position + 1) % order.length]
        const sweep = normalize(next.angle - ray.angle)
        if (sweep < 1e-3) return []
        if (focus !== undefined && ray.index !== focus && next.index !== focus)
            return []
        if (sweep > Math.PI + 1e-6) return []
        return [
            {
                start: ray.angle,
                sweep,
                snapped: isStep(sweep),
                fromBaseline: false,
            },
        ]
    })
    return order.length === 2 ? sectors.slice(0, 1) : sectors
}

export function guidesAt(
    point: Point,
    neighbors: AngleNeighbor[]
): AngleGuideSet {
    const live = neighbors.filter((neighbor) => distance(neighbor, point) >= 1)
    return {
        vertices: [
            {
                center: point,
                sectors: live.length ? sectorsAround(point, live) : [],
            },
            ...live.map((neighbor) => {
                const sectors = sectorsAround(
                    neighbor,
                    [
                        point,
                        ...neighbor.others.filter(
                            (other) => distance(other, neighbor) >= 1
                        ),
                    ],
                    0
                )
                const smallest = sectors.reduce<AngleSector | undefined>(
                    (best, sector) =>
                        best && best.sweep <= sector.sweep ? best : sector,
                    undefined
                )
                return {
                    center: { x: neighbor.x, y: neighbor.y },
                    sectors:
                        neighbor.anchored && smallest ? [smallest] : sectors,
                }
            }),
        ],
        snapLines: live
            .filter((neighbor) => isSnapped(neighbor, point))
            .map((neighbor) => [{ x: neighbor.x, y: neighbor.y }, point]),
    }
}

export const vertexKey = (point: LinePointData) =>
    point.kind === 'anchorpoint'
        ? `anchor:${point.positionId}:${point.handle}`
        : point.id

const connectionsOf = (lines: Line[], key: string) =>
    lines.flatMap(({ points }) =>
        points.flatMap((point, index) =>
            vertexKey(point) === key
                ? [points[index - 1], points[index + 1]].filter(
                      (neighbor): neighbor is LinePointData =>
                          neighbor !== undefined
                  )
                : []
        )
    )

const uniqueByKey = (points: LinePointData[]) =>
    points.filter(
        (point, index) =>
            points.findIndex(
                (other) => vertexKey(other) === vertexKey(point)
            ) === index
    )

export function angleNeighbors(
    lines: Line[],
    moving: LinePointData,
    coordinatesOf: (point: LinePointData) => Point | undefined
): AngleNeighbor[] {
    const movingKey = vertexKey(moving)
    return uniqueByKey(connectionsOf(lines, movingKey)).flatMap((neighbor) => {
        const at = coordinatesOf(neighbor)
        if (!at || vertexKey(neighbor) === movingKey) return []
        const others = uniqueByKey(
            connectionsOf(lines, vertexKey(neighbor))
        ).flatMap((other) =>
            vertexKey(other) === movingKey ? [] : (coordinatesOf(other) ?? [])
        )
        if (neighbor.kind === 'anchorpoint')
            others.push(...nodeEdge(at, neighbor.handle))
        return [
            {
                x: at.x,
                y: at.y,
                others,
                anchored: neighbor.kind === 'anchorpoint',
            },
        ]
    })
}

const nodeEdge = ({ x, y }: Point, handle: HandleSide): Point[] =>
    handle === 'top' || handle === 'bottom'
        ? [
              { x: x - 10, y },
              { x: x + 10, y },
          ]
        : [
              { x, y: y - 10 },
              { x, y: y + 10 },
          ]
