import { PositionTypes, type ChartDocument } from '../domain/chart.types'
import {
    lineError,
    hasLineCycle,
    incomingLineCount,
    resolveLineSource,
} from '../domain/lineGraph'
import { zPermission } from 'pv-contracts/data'
import { z } from 'zod'

export const zHandleSide = z.enum(['top', 'right', 'bottom', 'left'])

export const zPosition = z.strictObject({
    id: z.number().int().positive(),
    name: z.string(),
    coordinates: z
        .strictObject({ x: z.number().finite(), y: z.number().finite() })
        .optional(),
    type: z.nativeEnum(PositionTypes),
    seats: z.number().int().nonnegative().nullable(),
    userIds: z.array(z.number().int()),
    permissions: z.array(zPermission).default([]),
    parentGroupId: z.number().int().positive().optional(),
    groupBounds: z
        .strictObject({
            x: z.number().finite().max(0),
            y: z.number().finite().max(0),
            width: z.number().finite().positive(),
            height: z.number().finite().positive(),
        })
        .optional(),
})

export const zAnchorPoint = z.strictObject({
    id: z.string(),
    kind: z.literal('anchorpoint'),
    positionId: z.number().int().positive(),
    handle: zHandleSide,
})

export const zWaypoint = z.strictObject({
    id: z.string(),
    kind: z.literal('waypoint'),
    coordinates: z.strictObject({
        x: z.number().finite(),
        y: z.number().finite(),
    }),
})

const zBranchPointReference = z.strictObject({
    id: z.string().min(1),
    kind: z.literal('branchpoint'),
})

const zBranchPoint = z.strictObject({
    id: z.string().min(1),
    coordinates: z.strictObject({
        x: z.number().finite(),
        y: z.number().finite(),
    }),
})

const zLine = z.strictObject({
    id: z.string(),
    points: z.array(
        z.discriminatedUnion('kind', [
            zAnchorPoint,
            zWaypoint,
            zBranchPointReference,
        ])
    ),
})

export const zChartDocument = z
    .strictObject({
        version: z.literal(5),
        positions: z.array(zPosition),
        lines: z.array(zLine),
        branchPoints: z.array(zBranchPoint),
    })
    .superRefine((document, context) => {
        const positionsById = new Map<
            number,
            (typeof document.positions)[number]
        >()
        for (const [index, position] of document.positions.entries()) {
            if (positionsById.has(position.id))
                context.addIssue({
                    code: 'custom',
                    path: ['positions', index, 'id'],
                    message: `Duplicate position id ${position.id}`,
                })
            positionsById.set(position.id, position)
        }

        const lineIds = new Set<string>()
        const linesById = new Map(document.lines.map((line) => [line.id, line]))
        const pointIds = new Set<string>()
        const branchIds = new Set<string>()
        for (const [index, point] of document.branchPoints.entries()) {
            if (branchIds.has(point.id))
                context.addIssue({
                    code: 'custom',
                    path: ['branchPoints', index, 'id'],
                    message: `Duplicate branchpoint id ${point.id}`,
                })
            branchIds.add(point.id)
        }
        for (const branch of document.branchPoints) {
            const owners = document.lines.filter((line) =>
                line.points
                    .slice(1)
                    .some(
                        (point) =>
                            point.kind === 'branchpoint' &&
                            point.id === branch.id
                    )
            )
            const children = document.lines.filter(
                (line) =>
                    line.points[0]?.kind === 'branchpoint' &&
                    line.points[0].id === branch.id
            )
            const incomingEnds = owners.every(
                (owner) => owner.points.at(-1)?.id === branch.id
            )
            if (
                owners.length === 0 ||
                (children.length > 0 &&
                    (!incomingEnds || owners.length + children.length < 3)) ||
                (children.length === 0 &&
                    (owners.length !== 1 ||
                        owners[0]?.points.at(-1)?.id === branch.id))
            )
                context.addIssue({
                    code: 'custom',
                    path: ['branchPoints'],
                    message: `Branchpoint ${branch.id} must be an interior point or a junction joining at least three segments`,
                })
        }
        const cyclic = hasLineCycle(document.lines)
        for (const [index, line] of document.lines.entries()) {
            if (lineIds.has(line.id))
                context.addIssue({
                    code: 'custom',
                    path: ['lines', index, 'id'],
                    message: `Duplicate line id ${line.id}`,
                })
            lineIds.add(line.id)

            const error = lineError(line)
            if (error)
                context.addIssue({
                    code: 'custom',
                    path: ['lines', index],
                    message: error,
                })
            const source = line.points[0]
            const end = line.points.at(-1)
            if (end?.kind === 'branchpoint') {
                const outgoing = document.lines.filter((child) => {
                    const start = child.points[0]
                    return start?.kind === 'branchpoint' && start.id === end.id
                }).length
                if (
                    outgoing === 0 ||
                    (outgoing === 1 &&
                        incomingLineCount(end.id, document.lines) < 2)
                )
                    context.addIssue({
                        code: 'custom',
                        path: ['lines', index],
                        message:
                            'A junction must have two outgoing segments or merge two incoming segments',
                    })
            }
            if (source?.kind === 'branchpoint') {
                if (!error && (cyclic || !resolveLineSource(line, linesById)))
                    context.addIssue({
                        code: 'custom',
                        path: ['lines', index],
                        message: 'Branch lines cannot form a cycle',
                    })
            }

            for (const [pointIndex, point] of line.points.entries()) {
                if (point.kind === 'branchpoint') {
                    if (!branchIds.has(point.id))
                        context.addIssue({
                            code: 'custom',
                            path: ['lines', index, 'points', pointIndex],
                            message: `Unknown branchpoint ${point.id}`,
                        })
                    continue
                }
                if (branchIds.has(point.id))
                    context.addIssue({
                        code: 'custom',
                        path: ['lines', index, 'points', pointIndex, 'id'],
                        message: `Point id ${point.id} conflicts with a branchpoint`,
                    })
                if (pointIds.has(point.id))
                    context.addIssue({
                        code: 'custom',
                        path: ['lines', index, 'points', pointIndex, 'id'],
                        message: `Duplicate point id ${point.id}`,
                    })
                pointIds.add(point.id)
                if (point.kind !== 'anchorpoint') continue
                if (!positionsById.has(point.positionId))
                    context.addIssue({
                        code: 'custom',
                        path: [
                            'lines',
                            index,
                            'points',
                            pointIndex,
                            'positionId',
                        ],
                        message: `Unknown position ${point.positionId}`,
                    })
            }
        }

        for (const [index, position] of document.positions.entries()) {
            if (position.parentGroupId === undefined) continue
            const parent = positionsById.get(position.parentGroupId)
            if (!parent)
                context.addIssue({
                    code: 'custom',
                    path: ['positions', index, 'parentGroupId'],
                    message: `Unknown parent group ${position.parentGroupId}`,
                })
            else if (parent.type !== PositionTypes.GROUP)
                context.addIssue({
                    code: 'custom',
                    path: ['positions', index, 'parentGroupId'],
                    message: `Parent ${parent.id} is not a group`,
                })
            if (position.parentGroupId === position.id)
                context.addIssue({
                    code: 'custom',
                    path: ['positions', index, 'parentGroupId'],
                    message: 'A group cannot contain itself',
                })
        }

        const visit = (positionId: number, path: Set<number>): boolean => {
            if (path.has(positionId)) return true
            const parentId = positionsById.get(positionId)?.parentGroupId
            if (parentId === undefined || !positionsById.has(parentId))
                return false
            path.add(positionId)
            const cycle = visit(parentId, path)
            path.delete(positionId)
            return cycle
        }
        for (const [index, position] of document.positions.entries()) {
            if (
                position.parentGroupId !== undefined &&
                positionsById.has(position.parentGroupId) &&
                visit(position.id, new Set())
            )
                context.addIssue({
                    code: 'custom',
                    path: ['positions', index, 'parentGroupId'],
                    message: 'Group membership cannot contain a cycle',
                })
        }
    })

export function validateChartDocument(value: unknown): ChartDocument {
    return zChartDocument.parse(value)
}
