import { linePointNodeType } from './linePointNodes'
import type { Node } from '@xyflow/react'

export interface AlignmentGuide {
    position: number
    center: boolean
}

export interface AlignmentGuides {
    horizontal?: AlignmentGuide
    vertical?: AlignmentGuide
}

const SNAP_RADIUS = 10

export function alignDraggedNodes(
    nodes: Node[],
    movedIds: ReadonlySet<string>
): { nodes: Node[]; guides: AlignmentGuides } {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const origins = new Map<string, { x: number; y: number }>()
    const origin = (node: Node): { x: number; y: number } => {
        const cached = origins.get(node.id)
        if (cached) return cached
        const parent = node.parentId ? byId.get(node.parentId) : undefined
        const offset = parent ? origin(parent) : { x: 0, y: 0 }
        const result = {
            x: offset.x + node.position.x,
            y: offset.y + node.position.y,
        }
        origins.set(node.id, result)
        return result
    }
    const size = (node: Node) => ({
        width:
            node.measured?.width ??
            node.width ??
            Number(node.style?.width ?? 0),
        height:
            node.measured?.height ??
            node.height ??
            Number(node.style?.height ?? 0),
    })
    const movesWithSelection = (node: Node): boolean =>
        movedIds.has(node.id) ||
        Boolean(
            node.parentId &&
            byId.has(node.parentId) &&
            movesWithSelection(byId.get(node.parentId)!)
        )
    const roots = nodes.filter(
        (node) =>
            movedIds.has(node.id) &&
            !(
                node.parentId &&
                byId.has(node.parentId) &&
                movesWithSelection(byId.get(node.parentId)!)
            )
    )
    if (!roots.length) return { nodes, guides: {} }
    const boxes = roots.map((node) => ({ ...origin(node), ...size(node) }))
    const left = Math.min(...boxes.map(({ x }) => x))
    const top = Math.min(...boxes.map(({ y }) => y))
    const right = Math.max(...boxes.map(({ x, width }) => x + width))
    const bottom = Math.max(...boxes.map(({ y, height }) => y + height))
    const pointsOnly = roots.every((node) => node.type === linePointNodeType)
    const anchors = (start: number, end: number, point: boolean) =>
        point
            ? [{ position: (start + end) / 2, center: true }]
            : [
                  { position: start, center: false },
                  { position: end, center: false },
                  { position: (start + end) / 2, center: true },
              ]
    let xMatch: { delta: number; guide: AlignmentGuide } | undefined
    let yMatch: { delta: number; guide: AlignmentGuide } | undefined
    const match = (
        sources: AlignmentGuide[],
        targets: AlignmentGuide[],
        previous: typeof xMatch
    ) => {
        let best = previous
        for (const source of sources)
            for (const target of targets) {
                const delta = target.position - source.position
                if (
                    Math.abs(delta) <= SNAP_RADIUS &&
                    (!best || Math.abs(delta) < Math.abs(best.delta))
                )
                    best = { delta, guide: target }
            }
        return best
    }
    for (const target of nodes) {
        if (target.hidden || movesWithSelection(target)) continue
        const position = origin(target)
        const dimensions = size(target)
        const point = target.type === linePointNodeType
        xMatch = match(
            anchors(left, right, pointsOnly),
            anchors(position.x, position.x + dimensions.width, point),
            xMatch
        )
        yMatch = match(
            anchors(top, bottom, pointsOnly),
            anchors(position.y, position.y + dimensions.height, point),
            yMatch
        )
    }

    for (const node of roots) {
        const parent = node.parentId ? byId.get(node.parentId) : undefined
        if (!parent || node.extent !== 'parent') continue
        const parentSize = size(parent)
        const nodeSize = size(node)
        if (
            xMatch &&
            (node.position.x + xMatch.delta < 0 ||
                node.position.x + xMatch.delta + nodeSize.width >
                    parentSize.width)
        )
            xMatch = undefined
        if (
            yMatch &&
            (node.position.y + yMatch.delta < 0 ||
                node.position.y + yMatch.delta + nodeSize.height >
                    parentSize.height)
        )
            yMatch = undefined
    }
    const rootIds = new Set(roots.map(({ id }) => id))
    return {
        nodes: nodes.map((node) =>
            rootIds.has(node.id) && (xMatch?.delta || yMatch?.delta)
                ? {
                      ...node,
                      position: {
                          x: node.position.x + (xMatch?.delta ?? 0),
                          y: node.position.y + (yMatch?.delta ?? 0),
                      },
                  }
                : node
        ),
        guides: { vertical: xMatch?.guide, horizontal: yMatch?.guide },
    }
}
