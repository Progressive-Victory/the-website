import { type Line, type Waypoint } from '../domain/chart.types'
import { isMovablePoint } from '../domain/lineGraph'

export interface Point {
    x: number
    y: number
}

export function lineVertices(
    line: Line,
    source: Point,
    target: Point
): Point[] {
    return [
        source,
        ...line.points
            .slice(1, -1)
            .flatMap((point) =>
                isMovablePoint(point) ? [point.coordinates] : []
            ),
        target,
    ]
}

export function insertLinePoint(
    line: Line,
    segmentIndex: number,
    coordinates: Point
): Line {
    const point: Waypoint = {
        id: crypto.randomUUID(),
        kind: 'waypoint',
        coordinates,
    }
    const points = [...line.points]
    points.splice(segmentIndex + 1, 0, point)
    return { ...line, points }
}

export function closestSegment(vertices: Point[], coordinates: Point): number {
    let nearest = 0
    let distance = Infinity
    for (let index = 0; index < vertices.length - 1; index++) {
        const start = vertices[index]
        const end = vertices[index + 1]
        const dx = end.x - start.x
        const dy = end.y - start.y
        const lengthSquared = dx * dx + dy * dy
        const t =
            lengthSquared === 0
                ? 0
                : Math.max(
                      0,
                      Math.min(
                          1,
                          ((coordinates.x - start.x) * dx +
                              (coordinates.y - start.y) * dy) /
                              lengthSquared
                      )
                  )
        const next = Math.hypot(
            coordinates.x - start.x - t * dx,
            coordinates.y - start.y - t * dy
        )
        if (next < distance) {
            distance = next
            nearest = index
        }
    }
    return nearest
}

export function lineHitboxOutline(vertices: Point[], width: number): string {
    const half = width / 2
    const parts: string[] = []
    vertices.slice(1).forEach((end, index) => {
        const start = vertices[index]
        const length = Math.hypot(end.x - start.x, end.y - start.y)
        if (!length) return
        const nx = (-(end.y - start.y) / length) * half
        const ny = ((end.x - start.x) / length) * half
        parts.push(
            `M ${start.x + nx},${start.y + ny} L ${end.x + nx},${end.y + ny} L ${end.x - nx},${end.y - ny} L ${start.x - nx},${start.y - ny} Z`
        )
    })
    for (const { x, y } of vertices.slice(1, -1))
        parts.push(
            `M ${x + half},${y} A ${half} ${half} 0 1 0 ${x - half},${y} A ${half} ${half} 0 1 0 ${x + half},${y} Z`
        )
    return parts.join(' ')
}
