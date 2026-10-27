import { type BranchPoint, type Line } from '../domain/chart.types'
import { resolveLinePoints } from '../domain/lineGraph'
import type { Node } from '@xyflow/react'

export const linePointNodeType = 'linePointSelection'
export const linePointRadius = 10

export function linePointNodes(
    lines: Line[],
    branchPoints: BranchPoint[]
): Node[] {
    const nodes = new Map<string, Node>()
    for (const line of lines) {
        for (const point of resolveLinePoints(line, branchPoints).points) {
            if (point.kind === 'anchorpoint' || nodes.has(point.id)) continue
            nodes.set(point.id, {
                id: `linepoint:${point.id}`,
                type: linePointNodeType,
                className: 'nokey',
                position: {
                    x: point.coordinates.x - linePointRadius,
                    y: point.coordinates.y - linePointRadius,
                },
                width: linePointRadius * 2,
                height: linePointRadius * 2,
                style: {
                    width: linePointRadius * 2,
                    height: linePointRadius * 2,
                },
                data: {
                    pointId: point.id,
                    label:
                        point.kind === 'waypoint' ? 'Waypoint' : 'Branchpoint',
                },
                ariaLabel: `${point.kind === 'waypoint' ? 'Waypoint' : 'Branchpoint'} selection`,
                connectable: false,
                deletable: false,
                zIndex: 30000,
            })
        }
    }
    return [...nodes.values()]
}
