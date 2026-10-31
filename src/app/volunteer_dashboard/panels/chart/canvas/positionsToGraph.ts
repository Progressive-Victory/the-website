import {
    PositionTypes,
    type Line,
    type Position,
    type GroupBounds,
    type UserProfile,
    type BranchPoint,
} from '../domain/chart.types'
import { resolveLineSource, resolveLineTarget } from '../domain/lineGraph'
import { getUserDisplayName, positionTypeLabels } from '../positions.list'
import { MarkerType, type Edge, type Node } from '@xyflow/react'

const GROUP_HEADER_GAP = 52

export const lineZIndex = 1000
export const positionNodeZIndex = 2000
export const highlightedLineZIndex = 10000

export interface Seat {
    userId: number | null
    username?: string
    discordId?: string
    image?: string | null
    name?: string
}

export function positionsToGraph(
    positions: Position[],
    users: UserProfile[] = [],
    titleHeights: Readonly<Record<string, number>> = {},
    lines: Line[] = [],
    branchPoints: BranchPoint[] = []
): {
    nodes: Node[]
    edges: Edge[]
    coordinateOffsets: Map<string, { x: number; y: number }>
    groupBounds: Map<number, GroupBounds>
} {
    const byId = new Map(positions.map((position) => [position.id, position]))
    const linesById = new Map(lines.map((line) => [line.id, line]))
    const usersById = new Map(users.map((user) => [user.id, user]))
    const parents = new Map<number, number>()
    for (const position of positions) {
        const parent = byId.get(position.parentGroupId!)
        if (
            position.parentGroupId === undefined ||
            parent?.type !== PositionTypes.GROUP
        )
            continue
        let ancestor: number | undefined = parent.id
        const visited = new Set<number>()
        let cyclic = false
        while (ancestor !== undefined) {
            if (ancestor === position.id || visited.has(ancestor)) {
                cyclic = true
                break
            }
            visited.add(ancestor)
            ancestor = parents.get(ancestor)
        }
        if (cyclic) {
            console.warn(
                `Cannot nest position ${position.id} in group ${parent.id}: cyclic group membership.`
            )
            continue
        }
        parents.set(position.id, parent.id)
    }
    const nodesById = new Map<number, Node>()
    const boundsOffsets = new Map<string, { x: number; y: number }>()
    const groupBounds = new Map<number, GroupBounds>()
    const makeNode = (position: Position): Node => {
        const existing = nodesById.get(position.id)
        if (existing) return existing
        const parentId = parents.get(position.id)
        const isGroup = position.type === PositionTypes.GROUP
        const seats: Seat[] = isGroup
            ? []
            : [
                  ...position.userIds.map((userId) => {
                      const user = usersById.get(userId)
                      const discord = user?.discordUsers?.[0]
                      return {
                          userId,
                          username: discord?.username,
                          discordId: discord?.id,
                          image: discord?.image,
                          name: user
                              ? [user.firstName?.trim(), user.lastName?.trim()]
                                    .filter(Boolean)
                                    .join(' ') ||
                                (discord?.username
                                    ? `@${discord.username}`
                                    : getUserDisplayName(user))
                              : `Unknown user #${userId}`,
                      }
                  }),
                  ...Array.from(
                      {
                          length: Math.max(
                              0,
                              (position.seats ?? 0) - position.userIds.length
                          ),
                      },
                      () => ({ userId: null })
                  ),
              ]
        const titleHeight = Math.max(
            isGroup ? 60 : 50,
            titleHeights[String(position.id)] ?? 0
        )
        const headerHeight = titleHeight + seats.length * 36
        const children = isGroup
            ? positions
                  .filter((child) => parents.get(child.id) === position.id)
                  .map(makeNode)
            : []
        const savedBounds = isGroup ? position.groupBounds : undefined
        const padding = savedBounds ? 0 : 30
        const boundsOffset = {
            x: Math.min(
                savedBounds?.x ?? 0,
                ...children.map((child) => child.position.x - padding)
            ),
            y: Math.min(
                savedBounds?.y ?? 0,
                ...children.map(
                    (child) =>
                        child.position.y -
                        (savedBounds ? 0 : titleHeight + GROUP_HEADER_GAP)
                )
            ),
        }
        boundsOffsets.set(String(position.id), boundsOffset)
        const nodeWidth =
            Math.max(
                240,
                (savedBounds?.x ?? 0) + (savedBounds?.width ?? 0),
                ...children.map(
                    (child) =>
                        child.position.x +
                        Number(child.style?.width ?? 240) +
                        padding
                )
            ) - boundsOffset.x
        const nodeHeight = isGroup
            ? Math.max(
                  140,
                  (savedBounds?.y ?? 0) + (savedBounds?.height ?? 0),
                  titleHeight + GROUP_HEADER_GAP + 30,
                  ...children.map(
                      (child) =>
                          child.position.y +
                          Number(child.style?.height ?? 88) +
                          padding
                  )
              ) - boundsOffset.y
            : headerHeight + 2
        if (isGroup)
            groupBounds.set(position.id, {
                ...boundsOffset,
                width: nodeWidth,
                height: nodeHeight,
            })
        const node: Node = {
            id: String(position.id),
            type: isGroup ? 'positionGroup' : 'positionSeats',
            className: 'nokey',
            position: {
                x: (position.coordinates?.x ?? 0) + boundsOffset.x,
                y: (position.coordinates?.y ?? 0) + boundsOffset.y,
            },
            ...(parentId !== undefined && {
                parentId: String(parentId),
                extent: 'parent' as const,
            }),
            style: { width: nodeWidth, height: nodeHeight },
            ...(!isGroup && { zIndex: positionNodeZIndex }),
            data: {
                label: position.name,
                seats,
                headerHeight,
            },
            ariaLabel: `${position.name}, ${positionTypeLabels[position.type]}`,
        }
        nodesById.set(position.id, node)
        return node
    }
    const nodes: Node[] = []
    const appendNodes = (parentId?: number) => {
        for (const position of positions.filter(
            (item) => parents.get(item.id) === parentId
        )) {
            nodes.push(makeNode(position))
            appendNodes(position.id)
        }
    }
    appendNodes()
    const coordinateOffsets = new Map<string, { x: number; y: number }>()
    for (const node of nodes) {
        const offset = node.parentId
            ? boundsOffsets.get(node.parentId)
            : undefined
        const own = boundsOffsets.get(node.id)!
        coordinateOffsets.set(node.id, {
            x: own.x - (offset?.x ?? 0),
            y: own.y - (offset?.y ?? 0),
        })
        if (offset) {
            node.position = {
                x: node.position.x - offset.x,
                y: node.position.y - offset.y,
            }
        }
    }
    return {
        nodes,
        coordinateOffsets,
        groupBounds,
        edges: lines
            .map((line) => ({
                line,
                source: resolveLineSource(line, linesById),
                target: resolveLineTarget(line, lines),
            }))
            .filter(
                ({ source, target }) =>
                    source &&
                    target &&
                    byId.has(source.positionId) &&
                    byId.has(target.positionId)
            )
            .flatMap(({ line, source, target }) => {
                if (!source || !target) return []
                const start = line.points[0]
                const end = line.points.at(-1)
                const branch =
                    start.kind === 'branchpoint'
                        ? branchPoints.find((point) => point.id === start.id)
                        : undefined
                const targetBranch =
                    end?.kind === 'branchpoint'
                        ? branchPoints.find((point) => point.id === end.id)
                        : undefined
                return [
                    {
                        id: line.id,
                        source: String(source.positionId),
                        target: String(target.positionId),
                        sourceHandle: source.handle,
                        targetHandle: target.handle,
                        type: 'basic',
                        data: {
                            line,
                            ...(branch && {
                                branchSource: branch.coordinates,
                            }),
                            ...(targetBranch && {
                                branchTarget: targetBranch.coordinates,
                            }),
                        },
                        markerEnd:
                            end?.kind === 'branchpoint'
                                ? undefined
                                : { type: MarkerType.ArrowClosed },
                    },
                ]
            }),
    }
}
