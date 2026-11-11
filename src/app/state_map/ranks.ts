export interface RankStop {
    offset: number
    color: string
}

/** One flat wedge of the crystal lattice, in tile coordinates. */
export interface RankFacet {
    points: string
    color: string
    opacity: number
}

export interface Rank {
    name: string
    /** Metallic ramp: shadow -> specular band -> shadow. Repeated offsets make a hard facet edge. */
    stops: RankStop[]
    /** Ramp for the state body when its material differs from the bevel. Defaults to `stops`. */
    bodyStops?: RankStop[]
    /** Dark rim that keeps the metal reading against the map background. */
    rim: string
    /** Overrides `rim` with a ramp when the outline itself should shift hue. */
    rimStops?: RankStop[]
    /** Tiled wedges overlaid on the body to read as cut crystal. */
    facets?: RankFacet[]
}

export const RANKS: Rank[] = [
    {
        name: 'Bronze',
        rim: '#2A1409',
        stops: [
            { offset: 0, color: '#3A1B0C' },
            { offset: 0.22, color: '#8A4820' },
            { offset: 0.44, color: '#C87A3D' },
            { offset: 0.5, color: '#F5C99B' },
            { offset: 0.56, color: '#B9682F' },
            { offset: 0.8, color: '#6B3816' },
            { offset: 1, color: '#3A1B0C' },
        ],
    },
    {
        name: 'Silver',
        rim: '#2B3036',
        stops: [
            { offset: 0, color: '#4E545B' },
            { offset: 0.22, color: '#868D95' },
            { offset: 0.44, color: '#C4CBD2' },
            { offset: 0.5, color: '#FFFFFF' },
            { offset: 0.56, color: '#AEB5BD' },
            { offset: 0.8, color: '#70777F' },
            { offset: 1, color: '#474D54' },
        ],
    },
    {
        name: 'Gold',
        rim: '#3A2800',
        stops: [
            { offset: 0, color: '#6B4A00' },
            { offset: 0.22, color: '#A97C10' },
            { offset: 0.44, color: '#E6BC3E' },
            { offset: 0.5, color: '#FFF6C4' },
            { offset: 0.56, color: '#E3B62F' },
            { offset: 0.8, color: '#9A700C' },
            { offset: 1, color: '#5E4100' },
        ],
    },
    {
        name: 'Platinum',
        rim: '#2E4449',
        stops: [
            { offset: 0, color: '#4E6E76' },
            { offset: 0.18, color: '#86AAB2' },
            { offset: 0.42, color: '#C9E2E6' },
            { offset: 0.48, color: '#FFFFFF' },
            { offset: 0.54, color: '#BBD6DC' },
            { offset: 0.75, color: '#7D9FA8' },
            { offset: 1, color: '#4E6E76' },
        ],
    },
    {
        name: 'Diamond',
        rim: '#0C0918',
        // Violet bevel wrapping an icy gem, cut into flat wedges like the badge's facets.
        rimStops: [
            { offset: 0, color: '#4A3A78' },
            { offset: 0.45, color: '#241B45' },
            { offset: 1, color: '#0C0918' },
        ],
        stops: [
            { offset: 0, color: '#2A1F52' },
            { offset: 0.12, color: '#6A5CA8' },
            { offset: 0.12, color: '#9C8FD8' },
            { offset: 0.28, color: '#C6BCEC' },
            { offset: 0.38, color: '#F0ECFF' },
            { offset: 0.42, color: '#FFFFFF' },
            { offset: 0.48, color: '#C9C0EC' },
            { offset: 0.48, color: '#9A8FD0' },
            { offset: 0.68, color: '#6E62AC' },
            { offset: 0.68, color: '#554A90' },
            { offset: 0.85, color: '#3A2F6E' },
            { offset: 1, color: '#1E1640' },
        ],
        bodyStops: [
            { offset: 0, color: '#E8EDF8' },
            { offset: 0.1, color: '#FFFFFF' },
            { offset: 0.1, color: '#DCE4F4' },
            { offset: 0.24, color: '#C3CFE6' },
            { offset: 0.24, color: '#EDF2FC' },
            { offset: 0.38, color: '#FDFEFF' },
            { offset: 0.44, color: '#FFFFFF' },
            { offset: 0.5, color: '#D3DCEF' },
            { offset: 0.5, color: '#AEBBD8' },
            { offset: 0.64, color: '#94A3C0' },
            { offset: 0.64, color: '#B7C2DA' },
            { offset: 0.78, color: '#8793B8' },
            { offset: 0.78, color: '#6B74A8' },
            { offset: 1, color: '#58628F' },
        ],
        facets: [
            { points: '0,0 96,0 48,34', color: '#FFFFFF', opacity: 0.62 },
            { points: '0,0 48,34 0,62', color: '#6B74A8', opacity: 0.34 },
            { points: '96,0 96,52 48,34', color: '#AEBBD8', opacity: 0.38 },
            { points: '48,34 96,52 62,96', color: '#FFFFFF', opacity: 0.3 },
            { points: '48,34 62,96 10,80', color: '#5A6490', opacity: 0.3 },
            { points: '0,62 48,34 10,80', color: '#FFFFFF', opacity: 0.45 },
            { points: '0,62 10,80 0,96', color: '#94A3C0', opacity: 0.36 },
            { points: '62,96 96,52 96,96', color: '#7C88AE', opacity: 0.34 },
            { points: '10,80 62,96 0,96', color: '#EDF2FC', opacity: 0.4 },
        ],
    },
]

export const rankGradientCss = ({ stops, bodyStops }: Rank) =>
    `linear-gradient(to bottom, ${(bodyStops ?? stops)
        .map(({ offset, color }) => `${color} ${offset * 100}%`)
        .join(', ')})`

/** Hashed off the name so the server and client pick the same rank. */
export function rankFor(name: string): Rank {
    let hash = 0
    for (const char of name) hash = (hash * 131 + char.charCodeAt(0)) % 100003
    return RANKS[hash % RANKS.length]
}
