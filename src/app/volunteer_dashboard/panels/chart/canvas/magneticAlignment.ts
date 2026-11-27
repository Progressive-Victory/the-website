import {
    equalSpacingGuides,
    findEqualSpacing,
    type Box,
    type SpacingGuide,
} from './equalSpacing'
import { linePointNodeType } from './linePointNodes'
import { GROUP_INSET } from './positions.placement'
import type { Node } from '@xyflow/react'

export interface AlignmentGuide {
    position: number
    center: boolean
}

export interface AlignmentGuides {
    horizontal?: AlignmentGuide
    vertical?: AlignmentGuide
    spacing?: SpacingGuide[]
}

const SNAP_RADIUS = 10

interface AxisMatch {
    delta: number
    guide?: AlignmentGuide
    gap?: number
}

// Equal spacing wins an axis when it needs a smaller nudge than edge/center alignment.
function preferSpacing(
    alignment: AxisMatch | undefined,
    selection: Box,
    siblings: Box[],
    axis: 'x' | 'y'
): AxisMatch | undefined {
    const spacing = findEqualSpacing(selection, siblings, axis, SNAP_RADIUS)
    if (!spacing) return alignment
    if (alignment && Math.abs(alignment.delta) < Math.abs(spacing.delta))
        return alignment
    return { delta: spacing.delta, gap: spacing.gap }
}

const nodeSize = (node: Node) => ({
    width: node.measured?.width ?? node.width ?? Number(node.style?.width ?? 0),
    height:
        node.measured?.height ?? node.height ?? Number(node.style?.height ?? 0),
})

// Drops a snap that would push a grouped node past its parent's inner edge.
function keepInsideParents(
    match: AxisMatch | undefined,
    roots: Node[],
    byId: ReadonlyMap<string, Node>,
    axis: 'x' | 'y'
): AxisMatch | undefined {
    if (!match) return match
    const extent = axis === 'x' ? 'width' : 'height'
    for (const node of roots) {
        const parent = node.parentId ? byId.get(node.parentId) : undefined
        if (!parent) continue
        const next = node.position[axis] + match.delta
        if (
            next < GROUP_INSET ||
            next + nodeSize(node)[extent] >
                nodeSize(parent)[extent] - GROUP_INSET
        )
            return undefined
    }
    return match
}

function spacingGuides(
    selection: Box,
    siblings: Box[],
    xMatch: AxisMatch | undefined,
    yMatch: AxisMatch | undefined
): SpacingGuide[] {
    const snapped = {
        ...selection,
        x: selection.x + (xMatch?.delta ?? 0),
        y: selection.y + (yMatch?.delta ?? 0),
    }
    return [
        ...(xMatch?.gap === undefined
            ? []
            : equalSpacingGuides(snapped, siblings, 'x', xMatch.gap)),
        ...(yMatch?.gap === undefined
            ? []
            : equalSpacingGuides(snapped, siblings, 'y', yMatch.gap)),
    ]
}

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
    const size = nodeSize
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
    let xMatch: AxisMatch | undefined
    let yMatch: AxisMatch | undefined
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

    const selection = {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    }
    const parentId = roots[0].parentId
    const siblings: Box[] =
        pointsOnly || roots.some((node) => node.parentId !== parentId)
            ? []
            : nodes
                  .filter(
                      (node) =>
                          !node.hidden &&
                          node.parentId === parentId &&
                          node.type !== linePointNodeType &&
                          !movesWithSelection(node)
                  )
                  .map((node) => ({ ...origin(node), ...size(node) }))
    xMatch = keepInsideParents(
        preferSpacing(xMatch, selection, siblings, 'x'),
        roots,
        byId,
        'x'
    )
    yMatch = keepInsideParents(
        preferSpacing(yMatch, selection, siblings, 'y'),
        roots,
        byId,
        'y'
    )
    const rootIds = new Set(roots.map(({ id }) => id))
    const spacing = spacingGuides(selection, siblings, xMatch, yMatch)
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
        guides: {
            vertical: xMatch?.guide,
            horizontal: yMatch?.guide,
            ...(spacing.length > 0 && { spacing }),
        },
    }
}
