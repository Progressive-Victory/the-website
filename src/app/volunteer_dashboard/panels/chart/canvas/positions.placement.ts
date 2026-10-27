import type { Node } from '@xyflow/react'

export function snapNodeCenters(
    nodes: Node[],
    movedIds: ReadonlySet<string>
): Node[] {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const result = new Map<string, Node>()
    const snap = (node: Node): Node => {
        const cached = result.get(node.id)
        if (cached) return cached
        const parent = node.parentId ? byId.get(node.parentId) : undefined
        if (parent) snap(parent)
        const absolutePosition = (item: Node): { x: number; y: number } => {
            const current = result.get(item.id) ?? item
            const ancestor = current.parentId
                ? byId.get(current.parentId)
                : undefined
            const origin = ancestor
                ? absolutePosition(ancestor)
                : { x: 0, y: 0 }
            return {
                x: origin.x + current.position.x,
                y: origin.y + current.position.y,
            }
        }
        let next = node
        if (movedIds.has(node.id)) {
            const origin = parent ? absolutePosition(parent) : { x: 0, y: 0 }
            const width = node.measured?.width ?? Number(node.style?.width ?? 0)
            const height =
                node.measured?.height ?? Number(node.style?.height ?? 0)
            const snapAxis = (
                value: number,
                offset: number,
                size: number,
                parentSize?: number
            ) => {
                const snapped =
                    Math.round((offset + value + size / 2) / 5) * 5 -
                    offset -
                    size / 2
                return parentSize === undefined
                    ? snapped
                    : Math.max(0, Math.min(snapped, parentSize - size))
            }
            const position = {
                x: snapAxis(
                    node.position.x,
                    origin.x,
                    width,
                    parent
                        ? (parent.measured?.width ??
                              Number(parent.style?.width ?? 0))
                        : undefined
                ),
                y: snapAxis(
                    node.position.y,
                    origin.y,
                    height,
                    parent
                        ? (parent.measured?.height ??
                              Number(parent.style?.height ?? 0))
                        : undefined
                ),
            }
            if (
                position.x !== node.position.x ||
                position.y !== node.position.y
            )
                next = { ...node, position }
        }
        result.set(node.id, next)
        return next
    }
    return nodes.map(snap)
}

export interface PlacementBox {
    x: number
    y: number
    width: number
    height: number
}

export function findNewPosition(
    center: { x: number; y: number },
    occupied: PlacementBox[]
): { x: number; y: number } {
    const width = 240
    const height = 88
    const gap = 20
    const origin = {
        x: Math.round((center.x - width / 2) / 5) * 5,
        y: Math.round((center.y - height / 2) / 5) * 5,
    }
    const xs = new Set([origin.x])
    const ys = new Set([origin.y])
    for (const box of occupied) {
        xs.add(Math.floor((box.x - width - gap) / 5) * 5)
        xs.add(Math.ceil((box.x + box.width + gap) / 5) * 5)
        ys.add(Math.floor((box.y - height - gap) / 5) * 5)
        ys.add(Math.ceil((box.y + box.height + gap) / 5) * 5)
    }
    let best: { x: number; y: number } | undefined
    let distance = Infinity
    for (const x of xs) {
        for (const y of ys) {
            const nextDistance = (x - origin.x) ** 2 + (y - origin.y) ** 2
            if (nextDistance >= distance) continue
            if (
                occupied.some(
                    (box) =>
                        x < box.x + box.width + gap &&
                        x + width + gap > box.x &&
                        y < box.y + box.height + gap &&
                        y + height + gap > box.y
                )
            )
                continue
            best = { x, y }
            distance = nextDistance
        }
    }
    if (!best) throw new Error('Could not find space for a new position.')
    return best
}
