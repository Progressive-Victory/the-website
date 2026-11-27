interface Point {
    x: number
    y: number
}

interface Rect extends Point {
    width: number
    height: number
}

export type FlowPlacement = 'above' | 'below' | 'left' | 'right'

export interface FlowAnchor extends Point {
    orientation: 'horizontal' | 'vertical' | 'point'
    avoid?: [Point, Point][]
}

const placementOptions: Record<FlowAnchor['orientation'], FlowPlacement[]> = {
    horizontal: ['above', 'below'],
    vertical: ['right', 'left'],
    point: ['above', 'below', 'right', 'left'],
}

const overlapArea = (a: Rect, b: Rect) =>
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))

const crossesRect = ([a, b]: [Point, Point], rect: Rect) => {
    let enter = 0
    let exit = 1
    const dx = b.x - a.x
    const dy = b.y - a.y
    for (const [p, q] of [
        [-dx, a.x - rect.x],
        [dx, rect.x + rect.width - a.x],
        [-dy, a.y - rect.y],
        [dy, rect.y + rect.height - a.y],
    ]) {
        if (p === 0) {
            if (q < 0) return false
            continue
        }
        const t = q / p
        if (p < 0) enter = Math.max(enter, t)
        else exit = Math.min(exit, t)
        if (enter > exit) return false
    }
    return true
}

const contains = (rect: Rect, { x, y }: Point) =>
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height

export function pickPlacement(
    at: FlowAnchor,
    size: { width: number; height: number },
    gap: number,
    obstacles: Rect[]
): FlowPlacement {
    const { width, height } = size
    const rects: Record<FlowPlacement, Rect> = {
        above: { x: at.x - width / 2, y: at.y - gap - height, width, height },
        below: { x: at.x - width / 2, y: at.y + gap, width, height },
        right: { x: at.x + gap, y: at.y - height / 2, width, height },
        left: { x: at.x - gap - width, y: at.y - height / 2, width, height },
    }
    const options = placementOptions[at.orientation]
    const blocking = obstacles.filter((obstacle) => !contains(obstacle, at))
    const score = (placement: FlowPlacement) => {
        const rect = rects[placement]
        const covered = blocking.filter((obstacle) =>
            overlapArea(rect, obstacle)
        )
        return {
            things:
                covered.length +
                (at.avoid ?? []).filter((segment) => crossesRect(segment, rect))
                    .length,
            area: covered.reduce(
                (total, obstacle) => total + overlapArea(rect, obstacle),
                0
            ),
        }
    }
    return options.reduce((best, option) => {
        const a = score(option)
        const b = score(best)
        return a.things < b.things || (a.things === b.things && a.area < b.area)
            ? option
            : best
    })
}
