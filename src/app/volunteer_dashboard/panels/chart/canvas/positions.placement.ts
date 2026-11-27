import { linePointNodeType } from './linePointNodes'
import type { Node } from '@xyflow/react'

// Matches the group's border width so children stop at its inner edge.
export const GROUP_INSET = 2

export const POSITION_GRID = 5
export const LINE_POINT_GRID = 1

const gridFor = (node: Node) =>
    node.type === linePointNodeType ? LINE_POINT_GRID : POSITION_GRID

const nodeSize = (node: Node) => ({
    width: node.measured?.width ?? Number(node.style?.width ?? 0),
    height: node.measured?.height ?? Number(node.style?.height ?? 0),
})

const clampToParent = (
    position: { x: number; y: number },
    node: Node,
    parent: Node | undefined
) => {
    if (!parent) return position
    const own = nodeSize(node)
    const bounds = nodeSize(parent)
    const clamp = (value: number, size: number, parentSize: number) =>
        Math.max(GROUP_INSET, Math.min(value, parentSize - size - GROUP_INSET))
    return {
        x: clamp(position.x, own.width, bounds.width),
        y: clamp(position.y, own.height, bounds.height),
    }
}

// Multi-node drags snap one anchor and shift every node by the same amount, keeping them aligned.
function sharedSnapDelta(
    nodes: Node[],
    movedIds: ReadonlySet<string>,
    byId: ReadonlyMap<string, Node>
): { x: number; y: number } | undefined {
    if (movedIds.size < 2) return undefined
    const moved = nodes.filter(({ id }) => movedIds.has(id))
    const anchor =
        moved.find(({ type }) => type !== linePointNodeType) ?? moved[0]
    if (!anchor) return undefined
    let { x, y } = anchor.position
    const visited = new Set([anchor.id])
    let parent = anchor.parentId ? byId.get(anchor.parentId) : undefined
    while (parent && !visited.has(parent.id)) {
        visited.add(parent.id)
        x += parent.position.x
        y += parent.position.y
        parent = parent.parentId ? byId.get(parent.parentId) : undefined
    }
    const { width, height } = nodeSize(anchor)
    const grid = gridFor(anchor)
    const snap = (value: number) => Math.round(value / grid) * grid - value
    return { x: snap(x + width / 2), y: snap(y + height / 2) }
}

export function snapNodeCenters(
    nodes: Node[],
    movedIds: ReadonlySet<string>
): Node[] {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const shared = sharedSnapDelta(nodes, movedIds, byId)
    if (shared)
        return nodes.map((node) => {
            if (!movedIds.has(node.id)) return node
            const parent = node.parentId ? byId.get(node.parentId) : undefined
            return {
                ...node,
                position: clampToParent(
                    {
                        x: node.position.x + shared.x,
                        y: node.position.y + shared.y,
                    },
                    node,
                    parent
                ),
            }
        })
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
            const grid = gridFor(node)
            const snapAxis = (
                value: number,
                offset: number,
                size: number,
                parentSize?: number
            ) => {
                const snapped =
                    Math.round((offset + value + size / 2) / grid) * grid -
                    offset -
                    size / 2
                return parentSize === undefined
                    ? snapped
                    : Math.max(
                          GROUP_INSET,
                          Math.min(snapped, parentSize - size - GROUP_INSET)
                      )
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
