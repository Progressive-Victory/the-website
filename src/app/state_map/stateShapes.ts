import { statesData } from '@/components/Map/stateData'
import { stateOptions } from '@/models/states'
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'

export interface StateShape {
    name: string
    abbr: string
    /** Path drawn relative to the shape's own viewBox (`0 0 width height`) */
    path: string
    /** Placement on the shared coordinate grid */
    x: number
    y: number
    width: number
    height: number
}

export interface Canvas {
    width: number
    height: number
}

const RADIANS = Math.PI / 180
/** Radius of the projection sphere, in grid units. */
const PROJECTION_RADIUS = 1000

interface Conic {
    lambda0: number
    phi0: number
    parallels: [number, number]
}

/** Albers equal-area conic, the standard projection for a map of the lower 48. */
const LOWER_48: Conic = { lambda0: -96, phi0: 37.5, parallels: [29.5, 45.5] }

/** Extra room below the lower 48 for the inset band. */
const INSET_BAND = 1.25

/** The Near Islands wrap the antimeridian and would stretch Alaska's inset, so they are dropped. */
const ALEUTIAN_LIMIT = -170

/**
 * Non-contiguous states get their own conic so they keep their true shape, then are
 * scaled and clustered in the bottom-left corner (fractions of the full canvas).
 */
const INSETS: Record<
    string,
    { conic: Conic; scale: number; x: number; y: number }
> = {
    Alaska: {
        conic: { lambda0: -152, phi0: 50, parallels: [55, 65] },
        scale: 0.45,
        x: 0.01,
        y: 0.64,
    },
    Hawaii: {
        conic: { lambda0: -157, phi0: 13, parallels: [8, 18] },
        scale: 1,
        x: 0.3,
        y: 0.83,
    },
    'Puerto Rico': {
        conic: { lambda0: -66, phi0: 18, parallels: [8, 18] },
        scale: 1,
        x: 0.44,
        y: 0.9,
    },
}

type StateFeature = Feature<Polygon | MultiPolygon, { name: string }>

interface Bounds {
    minX: number
    minY: number
    maxX: number
    maxY: number
}

const abbrByName = new Map(
    stateOptions.map((s) => [s.label.toLowerCase(), s.value])
)

function ringsOf(feature: StateFeature): Position[][] {
    const { geometry } = feature
    return geometry.type === 'Polygon'
        ? geometry.coordinates
        : geometry.coordinates.flat()
}

function conicEqualArea(
    { lambda0, phi0, parallels: [phi1, phi2] }: Conic,
    scale: number
) {
    const n = (Math.sin(phi1 * RADIANS) + Math.sin(phi2 * RADIANS)) / 2
    const c = Math.cos(phi1 * RADIANS) ** 2 + 2 * n * Math.sin(phi1 * RADIANS)
    const rho = (phi: number) =>
        Math.sqrt(c - 2 * n * Math.sin(phi * RADIANS)) / n
    const rho0 = rho(phi0)
    const radius = PROJECTION_RADIUS * scale

    return ([lon, lat]: Position): [number, number] => {
        // Wraps the Aleutians back onto the near side of the central meridian.
        const delta = ((lon - lambda0 + 540) % 360) - 180
        const theta = n * delta * RADIANS
        const r = rho(lat)
        return [
            r * Math.sin(theta) * radius,
            (r * Math.cos(theta) - rho0) * radius,
        ]
    }
}

function boundsOf(rings: [number, number][][]): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
    }
    for (const ring of rings) {
        for (const [x, y] of ring) {
            if (x < bounds.minX) bounds.minX = x
            if (x > bounds.maxX) bounds.maxX = x
            if (y < bounds.minY) bounds.minY = y
            if (y > bounds.maxY) bounds.maxY = y
        }
    }
    return bounds
}

/** Node and the browser can differ in the last bits of Math.sin/sqrt, which trips React hydration. */
const round = (value: number) => Number(value.toFixed(4))

function toPath(rings: [number, number][][], origin: Bounds): string {
    return rings
        .map((ring) => {
            const points = ring.map(
                ([x, y]) =>
                    `${(x - origin.minX).toFixed(2)} ${(y - origin.minY).toFixed(2)}`
            )
            return `M${points.join('L')}Z`
        })
        .join('')
}

function buildShapes() {
    const features = statesData.features as StateFeature[]

    const projected = features.map((feature) => {
        const name = feature.properties.name
        const inset = INSETS[name]
        const project = conicEqualArea(
            inset?.conic ?? LOWER_48,
            inset?.scale ?? 1
        )
        const rings = ringsOf(feature)
            .filter(
                (ring) =>
                    name !== 'Alaska' ||
                    ring.some(
                        ([lon]) => (lon > 0 ? lon - 360 : lon) > ALEUTIAN_LIMIT
                    )
            )
            .map((ring) => ring.map(project))

        return { name, inset, rings, bounds: boundsOf(rings) }
    })

    const mainlandBounds = boundsOf(
        projected.filter(({ inset }) => !inset).flatMap(({ rings }) => rings)
    )
    const canvas: Canvas = {
        width: mainlandBounds.maxX - mainlandBounds.minX,
        height: (mainlandBounds.maxY - mainlandBounds.minY) * INSET_BAND,
    }

    const shapes: StateShape[] = projected.map(
        ({ name, inset, rings, bounds }) => ({
            name,
            abbr:
                abbrByName.get(name.toLowerCase()) ??
                name.slice(0, 2).toUpperCase(),
            path: toPath(rings, bounds),
            width: round(bounds.maxX - bounds.minX),
            height: round(bounds.maxY - bounds.minY),
            x: round(
                inset
                    ? inset.x * canvas.width
                    : bounds.minX - mainlandBounds.minX
            ),
            y: round(
                inset
                    ? inset.y * canvas.height
                    : bounds.minY - mainlandBounds.minY
            ),
        })
    )

    // Draw the smallest states last so their outlines stay visible.
    shapes.sort((a, b) => b.width * b.height - a.width * a.height)

    return { shapes, canvas }
}

export const { shapes: STATE_SHAPES, canvas: MAP_CANVAS } = buildShapes()
