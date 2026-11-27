'use client'

import type { Position } from '../api/domain/chart.types'
import { linePointNodeType, linePointRadius } from './linePointNodes'
import { canSetParentGroup } from './positions.connections'
import { GROUP_INSET } from './positions.placement'
import type { Node, XYPosition } from '@xyflow/react'
import { useRef, useState } from 'react'

export const POP_DISTANCE = 72
const RUBBER_LIMIT = 10

export interface Box {
    x: number
    y: number
    width: number
    height: number
}

export interface GroupDragFeedback {
    nodeId: string
    sourceGroupId?: string
    targetGroupId?: string
    progress: number
    popped: boolean
    pop?: XYPosition
}

export interface GroupDragSession {
    nodeId: string
    kind: 'node' | 'point'
    sourceGroupId?: string
    targetGroupId?: string
    popped: boolean
    position: XYPosition
    displayed: XYPosition
    pop?: XYPosition
}

export const nodeSize = (node: Node) => ({
    width: node.measured?.width ?? node.width ?? Number(node.style?.width ?? 0),
    height:
        node.measured?.height ?? node.height ?? Number(node.style?.height ?? 0),
})

export function absoluteBox(node: Node, byId: ReadonlyMap<string, Node>): Box {
    let { x, y } = node.position
    const visited = new Set([node.id])
    let parent = node.parentId ? byId.get(node.parentId) : undefined
    while (parent && !visited.has(parent.id)) {
        visited.add(parent.id)
        x += parent.position.x
        y += parent.position.y
        parent = parent.parentId ? byId.get(parent.parentId) : undefined
    }
    return { x, y, ...nodeSize(node) }
}

function overshoot(
    position: XYPosition,
    size: { width: number; height: number },
    parent: { width: number; height: number }
): XYPosition {
    const clamp = (value: number, max: number) =>
        Math.max(GROUP_INSET, Math.min(value, max - GROUP_INSET))
    return {
        x: position.x - clamp(position.x, parent.width - size.width),
        y: position.y - clamp(position.y, parent.height - size.height),
    }
}

const rubberBand = (distance: number) =>
    RUBBER_LIMIT * (1 - Math.exp(-distance / 40))

function findDropTarget(
    nodes: Node[],
    draggedId: string,
    canJoin: (groupId: string) => boolean
): string | undefined {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const dragged = byId.get(draggedId)
    if (!dragged) return undefined
    const box = absoluteBox(dragged, byId)
    return groupAtPoint(
        nodes,
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        (groupId) => groupId !== draggedId && canJoin(groupId)
    )
}

export function groupAtPoint(
    nodes: Node[],
    point: XYPosition,
    canJoin: (groupId: string) => boolean = () => true
): string | undefined {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    let best: { id: string; area: number } | undefined
    for (const node of nodes) {
        if (node.type !== 'positionGroup') continue
        const group = absoluteBox(node, byId)
        const inside =
            point.x >= group.x &&
            point.x <= group.x + group.width &&
            point.y >= group.y &&
            point.y <= group.y + group.height
        const area = group.width * group.height
        if (!inside || (best && area >= best.area) || !canJoin(node.id))
            continue
        best = { id: node.id, area }
    }
    return best?.id
}

const pointCenter = (node: Node) => ({
    x: node.position.x + linePointRadius,
    y: node.position.y + linePointRadius,
})

export function pointGroupChanges(
    nodes: Node[],
    moved: Node[]
): Record<string, number | undefined> {
    const changes: Record<string, number | undefined> = {}
    for (const node of moved) {
        if (node.type !== linePointNodeType) continue
        if (typeof node.data.pointId !== 'string') continue
        const groupId = groupAtPoint(nodes, pointCenter(node))
        const next = groupId === undefined ? undefined : Number(groupId)
        if (next !== node.data.parentGroupId) changes[node.data.pointId] = next
    }
    return changes
}

function resolvePosition(
    session: GroupDragSession,
    node: Node,
    parent: Node | undefined,
    raw: XYPosition
): { position: XYPosition; displayed: XYPosition; progress: number } {
    if (session.popped || !parent)
        return {
            position: node.position,
            displayed: node.position,
            progress: 0,
        }
    const beyond = overshoot(raw, nodeSize(node), nodeSize(parent))
    const distance = Math.hypot(beyond.x, beyond.y)
    if (distance >= POP_DISTANCE) {
        session.popped = true
        session.pop = {
            x: session.displayed.x - raw.x,
            y: session.displayed.y - raw.y,
        }
        return { position: raw, displayed: raw, progress: 0 }
    }
    const stretch = distance > 0 ? rubberBand(distance) / distance : 0
    return {
        position: node.position,
        displayed: {
            x: node.position.x + beyond.x * stretch,
            y: node.position.y + beyond.y * stretch,
        },
        progress: distance / POP_DISTANCE,
    }
}

export function regroupTarget(
    session: GroupDragSession,
    nodes: Node[],
    groupBounds: ReadonlyMap<number, { x: number; y: number }>
): { parentGroupId: number | undefined; coordinates: XYPosition } {
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const origin = (id: string | undefined) => {
        const group = id ? byId.get(id) : undefined
        if (!group) return { x: 0, y: 0 }
        const box = absoluteBox(group, byId)
        const offset = groupBounds.get(Number(id))
        return { x: box.x - (offset?.x ?? 0), y: box.y - (offset?.y ?? 0) }
    }
    const source = session.sourceGroupId
        ? byId.get(session.sourceGroupId)
        : undefined
    const sourceBox = source ? absoluteBox(source, byId) : { x: 0, y: 0 }
    const own = groupBounds.get(Number(session.nodeId))
    const target = origin(session.targetGroupId)
    const snap = (value: number) => Math.round(value / 5) * 5
    return {
        parentGroupId: session.targetGroupId
            ? Number(session.targetGroupId)
            : undefined,
        coordinates: {
            x: snap(
                sourceBox.x + session.position.x - (own?.x ?? 0) - target.x
            ),
            y: snap(
                sourceBox.y + session.position.y - (own?.y ?? 0) - target.y
            ),
        },
    }
}

export function useGroupDrag(positions: Position[], onPop: () => void) {
    const [feedback, setFeedback] = useState<GroupDragFeedback | null>(null)
    const session = useRef<GroupDragSession | null>(null)

    const poppedIds = (): ReadonlySet<string> =>
        session.current?.popped ? new Set([session.current.nodeId]) : new Set()

    const trackPoint = (nodes: Node[], node: Node) => {
        const groupId = node.data.parentGroupId
        const sourceGroupId =
            typeof groupId === 'number' ? String(groupId) : undefined
        const targetGroupId = groupAtPoint(nodes, pointCenter(node))
        session.current = {
            nodeId: node.id,
            kind: 'point',
            sourceGroupId,
            targetGroupId,
            popped: false,
            position: node.position,
            displayed: node.position,
        }
        setFeedback({
            nodeId: node.id,
            sourceGroupId,
            targetGroupId,
            progress: 0,
            popped: false,
        })
    }

    const update = (
        nodes: Node[],
        draggingIds: ReadonlySet<string>,
        desired: ReadonlyMap<string, XYPosition>
    ): Node[] => {
        const [nodeId] = draggingIds
        const node = nodes.find(({ id }) => id === nodeId)
        if (draggingIds.size !== 1 || !node) return nodes
        if (node.type === linePointNodeType) {
            trackPoint(nodes, node)
            return nodes
        }
        if (session.current?.nodeId !== nodeId)
            session.current = {
                nodeId,
                kind: 'node',
                sourceGroupId: node.parentId,
                popped: false,
                position: node.position,
                displayed: node.position,
            }
        const current = session.current
        const wasPopped = current.popped
        const parent = nodes.find(({ id }) => id === current.sourceGroupId)
        const raw = desired.get(nodeId) ?? node.position
        const { position, displayed, progress } = resolvePosition(
            current,
            node,
            parent,
            raw
        )
        if (current.popped && !wasPopped) onPop()
        current.position = position
        current.displayed = displayed
        current.targetGroupId = findDropTarget(
            nodes.map((item) =>
                item.id === nodeId ? { ...item, position } : item
            ),
            nodeId,
            (groupId) =>
                canSetParentGroup(positions, Number(nodeId), Number(groupId))
        )
        setFeedback({
            nodeId,
            sourceGroupId: current.sourceGroupId,
            targetGroupId: current.targetGroupId,
            progress,
            popped: current.popped,
            pop: current.pop,
        })
        return nodes.map((item) =>
            item.id === nodeId ? { ...item, position: displayed } : item
        )
    }

    const finish = () => {
        const finished = session.current
        session.current = null
        setFeedback(null)
        return finished
    }

    return { feedback, poppedIds, update, finish }
}
