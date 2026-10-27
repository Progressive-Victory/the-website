import {
    PositionTypes,
    type ChartDocument,
    type Line,
    type Position,
    type BranchPoint,
} from '../domain/chart.types'
import { upgradeBranchLines } from '../domain/lineOperations'
import {
    zHandleSide,
    zPosition,
    zAnchorPoint,
    zWaypoint,
    validateChartDocument,
} from './chart.validation'
import { z } from 'zod'

const zLegacyLine = z.strictObject({
    id: z.string(),
    points: z.array(
        z.preprocess(
            (value) => {
                if (
                    typeof value === 'object' &&
                    value !== null &&
                    'kind' in value &&
                    value.kind === 'linepoint'
                )
                    return { ...value, kind: 'waypoint' }
                return value
            },
            z.discriminatedUnion('kind', [
                zAnchorPoint,
                zWaypoint,
                zWaypoint.extend({ kind: z.literal('branchpoint') }),
                z.strictObject({
                    id: z.string(),
                    kind: z.literal('branchanchorpoint'),
                    lineId: z.string().min(1),
                    pointId: z.string().min(1),
                }),
            ])
        )
    ),
})

export function migrateVersion4(value: unknown): ChartDocument {
    const legacy = z
        .strictObject({
            version: z.literal(4),
            positions: z.array(zPosition),
            lines: z.array(zLegacyLine),
        })
        .parse(value)
    const branchPoints: BranchPoint[] = []
    const ids = new Set<string>()
    const lineIds = new Set<string>()
    for (const line of legacy.lines) {
        if (lineIds.has(line.id))
            throw new Error(`Duplicate line id ${line.id}`)
        lineIds.add(line.id)
        for (const point of line.points) {
            if (ids.has(point.id))
                throw new Error(`Duplicate point id ${point.id}`)
            ids.add(point.id)
            if (point.kind === 'branchpoint')
                branchPoints.push({
                    id: point.id,
                    coordinates: point.coordinates,
                })
            if (
                point.kind === 'branchanchorpoint' &&
                !legacy.lines
                    .find((parent) => parent.id === point.lineId)
                    ?.points.some(
                        (junction) =>
                            junction.id === point.pointId &&
                            junction.kind === 'branchpoint'
                    )
            )
                throw new Error('Unknown parent branchpoint')
        }
        if (
            line.points.length < 2 ||
            !['anchorpoint', 'branchanchorpoint'].includes(
                line.points[0].kind
            ) ||
            !['anchorpoint', 'branchpoint'].includes(
                line.points.at(-1)!.kind
            ) ||
            line.points
                .slice(1, -1)
                .some(
                    (point) =>
                        point.kind !== 'waypoint' &&
                        point.kind !== 'branchpoint'
                )
        )
            throw new Error(
                `Invalid endpoints or interior points in legacy line ${line.id}`
            )
    }
    const lines: Line[] = legacy.lines.map((line) => ({
        ...line,
        points: line.points.map((point) => {
            if (point.kind === 'branchanchorpoint')
                return { id: point.pointId, kind: 'branchpoint' }
            if (point.kind === 'branchpoint')
                return { id: point.id, kind: 'branchpoint' }
            return point
        }),
    }))
    return validateChartDocument({
        version: 5,
        positions: legacy.positions,
        lines: upgradeBranchLines(lines),
        branchPoints,
    })
}

const zVersion3Document = z.strictObject({
    version: z.literal(3),
    positions: z.array(zPosition),
    lines: z.array(
        z.strictObject({
            id: z.string(),
            points: z.array(
                z.discriminatedUnion('kind', [
                    zAnchorPoint.extend({ kind: z.literal('anchor') }),
                    zWaypoint.extend({ kind: z.literal('free') }),
                ])
            ),
        })
    ),
})

export function migrateVersion3(value: unknown): ChartDocument {
    const legacy = zVersion3Document.parse(value)
    return migrateVersion4({
        version: 4,
        positions: legacy.positions,
        lines: legacy.lines.map((line) => ({
            ...line,
            points: line.points.map((point) => ({
                ...point,
                kind: point.kind === 'anchor' ? 'anchorpoint' : 'waypoint',
            })),
        })),
    })
}

const zLegacyConnector = z.preprocess(
    (value) => {
        if (typeof value !== 'object' || value === null || Array.isArray(value))
            return value
        return Object.fromEntries(
            Object.entries(value).filter(
                ([key]) =>
                    key !== 'appearance' && key !== 'label' && key !== 'routing'
            )
        )
    },
    z.strictObject({
        id: z.string(),
        source: z.strictObject({
            positionId: z.number().int().positive(),
            handle: zHandleSide,
        }),
        target: z.strictObject({
            positionId: z.number().int().positive(),
            handle: zHandleSide,
        }),
    })
)

const zVersion2Document = z.strictObject({
    version: z.literal(2),
    positions: z.array(zPosition),
    connectors: z.array(zLegacyConnector),
})

export function migrateVersion2(value: unknown): ChartDocument {
    const legacy = zVersion2Document.parse(value)
    const lines: Line[] = legacy.connectors.map((connector) => ({
        id: connector.id,
        points: [
            {
                id: crypto.randomUUID(),
                kind: 'anchorpoint',
                ...connector.source,
            },
            {
                id: crypto.randomUUID(),
                kind: 'anchorpoint',
                ...connector.target,
            },
        ],
    }))
    return validateChartDocument({
        version: 5,
        positions: legacy.positions,
        lines,
        branchPoints: [],
    })
}

const zLegacyPositions = z.array(
    z.object({
        id: z.number().int().positive(),
        name: z.string(),
        coordinates: z
            .object({ x: z.number().finite(), y: z.number().finite() })
            .optional(),
        type: z.nativeEnum(PositionTypes),
        seats: z.number().int().nonnegative().nullable(),
        userIds: z.array(z.number().int()),
        childRelationships: z.array(
            z.object({
                id: z.number().int().positive(),
                sourceHandle: zHandleSide.optional(),
                targetHandle: zHandleSide.optional(),
            })
        ),
    })
)

export function legacyToChart(value: unknown): ChartDocument {
    const legacy = zLegacyPositions.parse(value)
    const lines: Line[] = []
    const positions: Position[] = legacy.map((position) => {
        if (position.type !== PositionTypes.GROUP) {
            for (const relationship of position.childRelationships) {
                lines.push({
                    id: crypto.randomUUID(),
                    points: [
                        {
                            id: crypto.randomUUID(),
                            kind: 'anchorpoint',
                            positionId: position.id,
                            handle: relationship.sourceHandle ?? 'bottom',
                        },
                        {
                            id: crypto.randomUUID(),
                            kind: 'anchorpoint',
                            positionId: relationship.id,
                            handle: relationship.targetHandle ?? 'top',
                        },
                    ],
                })
            }
        }
        return {
            id: position.id,
            name: position.name,
            coordinates: position.coordinates,
            type: position.type,
            seats: position.seats,
            userIds: position.userIds,
            parentGroupId: undefined,
        }
    })

    for (const group of legacy.filter(
        ({ type }) => type === PositionTypes.GROUP
    )) {
        for (const relationship of group.childRelationships) {
            const child = positions.find(({ id }) => id === relationship.id)
            if (!child)
                throw new Error(`Unknown child position ${relationship.id}`)
            if (
                child.parentGroupId !== undefined &&
                child.parentGroupId !== group.id
            )
                throw new Error(
                    `Position ${child.id} belongs to multiple groups`
                )
            child.parentGroupId = group.id
        }
    }
    return validateChartDocument({
        version: 5,
        positions,
        lines,
        branchPoints: [],
    })
}
