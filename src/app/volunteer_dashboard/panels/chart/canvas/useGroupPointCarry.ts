'use client'

import type { LinePointCoordinates } from './LineEditingContext'
import { linePointNodeType, linePointRadius } from './linePointNodes'
import { absoluteBox } from './useGroupDrag'
import type { Node, XYPosition } from '@xyflow/react'
import { useRef } from 'react'

interface CarriedPoints {
    origin: XYPosition
    points: Map<string, XYPosition>
}

const isWithinGroup = (
    groupId: string | undefined,
    ancestorId: string,
    byId: ReadonlyMap<string, Node>
) => {
    const visited = new Set<string>()
    for (
        let id = groupId;
        id && !visited.has(id);
        id = byId.get(id)?.parentId
    ) {
        if (id === ancestorId) return true
        visited.add(id)
    }
    return false
}

function collectPoints(
    nodes: Node[],
    draggingIds: ReadonlySet<string>
): Map<string, CarriedPoints> {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const claimed = new Set<string>()
    const carried = new Map<string, CarriedPoints>()
    for (const id of draggingIds) {
        const group = byId.get(id)
        if (group?.type !== 'positionGroup') continue
        const box = absoluteBox(group, byId)
        const inside = nodes.filter((node) => {
            const groupId = node.data.parentGroupId
            return (
                node.type === linePointNodeType &&
                typeof groupId === 'number' &&
                !draggingIds.has(node.id) &&
                !claimed.has(node.id) &&
                isWithinGroup(String(groupId), id, byId)
            )
        })
        inside.forEach(({ id: pointId }) => claimed.add(pointId))
        carried.set(id, {
            origin: { x: box.x, y: box.y },
            points: new Map(inside.map((node) => [node.id, node.position])),
        })
    }
    return carried
}

// Points live on their group's plane, so dragging a group carries its points (in canvas coordinates while editing).
export function useGroupPointCarry() {
    const session = useRef<Map<string, CarriedPoints> | null>(null)

    const update = (
        before: Node[],
        moved: Node[],
        draggingIds: ReadonlySet<string>,
        dragEnded: boolean
    ): { nodes: Node[]; points: LinePointCoordinates } => {
        if (!session.current && draggingIds.size)
            session.current = collectPoints(before, draggingIds)
        const carried = session.current
        if (dragEnded) session.current = null
        if (!carried?.size) return { nodes: moved, points: {} }

        const byId = new Map(moved.map((node) => [node.id, node]))
        const targets = new Map<string, XYPosition>()
        for (const [groupId, { origin, points }] of carried) {
            const group = byId.get(groupId)
            if (!group) continue
            const box = absoluteBox(group, byId)
            for (const [pointNodeId, start] of points)
                targets.set(pointNodeId, {
                    x: start.x + box.x - origin.x,
                    y: start.y + box.y - origin.y,
                })
        }
        const points: LinePointCoordinates = {}
        const nodes = moved.map((node) => {
            const position = targets.get(node.id)
            if (!position) return node
            if (typeof node.data.pointId === 'string')
                points[node.data.pointId] = {
                    x: position.x + linePointRadius,
                    y: position.y + linePointRadius,
                }
            return { ...node, position }
        })
        return { nodes, points }
    }

    return { update }
}
