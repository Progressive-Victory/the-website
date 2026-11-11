'use client'

import {
    COALITIONS,
    COALITION_BY_STATE,
    UNAFFILIATED_COLOR,
} from './coalitions'
import { RANKS, rankFor, rankGradientCss } from './ranks'
import styles from './stateMap.module.css'
import { MAP_CANVAS, STATE_SHAPES } from './stateShapes'
import { US_STATES } from '@/components/Map/constants'
import { getMemberCountColor } from '@/components/Map/util'
import { cn } from '@/util'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { zMapMemberCountsResponse } from 'pv-contracts/responses'
import { useState, type CSSProperties } from 'react'

type MapMode = 'density' | 'coalition' | 'ranks'

const MODES: { id: MapMode; label: string }[] = [
    { id: 'density', label: 'Member Density' },
    { id: 'coalition', label: 'Coalitions' },
    { id: 'ranks', label: 'Ranks' },
]

const ABBR_BY_NAME = new Map(STATE_SHAPES.map(({ name, abbr }) => [name, abbr]))

/** Coordinate space the facet wedges are authored in; scaled per state at render time. */
const FACET_TILE = 96

export function StateGridMap() {
    const [hovered, setHovered] = useState<string | null>(null)
    const [selected, setSelected] = useState<string | null>(null)
    const [mode, setMode] = useState<MapMode>('density')
    const { ready, onGet } = useFetch()

    const memberCountQuery = useQuery({
        queryKey: ['/map/memberCounts'],
        queryFn: ready
            ? async ({ signal }) => {
                  const data = await onGet(
                      '/map/memberCounts',
                      zMapMemberCountsResponse,
                      { signal }
                  )

                  data.states = US_STATES.reduce((map, state) => {
                      map[state.name] = map[state.code]
                      return map
                  }, data.states)

                  return data
              }
            : skipToken,
        placeholderData: keepPreviousData,
    })

    const stateMemberCounts = memberCountQuery.data?.states
    const totalMemberCount = memberCountQuery.data?.total

    const toggle = (name: string) =>
        setSelected((current) => (current === name ? null : name))

    const fillFor = (name: string, abbr: string) => {
        if (mode === 'coalition')
            return COALITION_BY_STATE.get(abbr)?.color ?? UNAFFILIATED_COLOR
        if (mode === 'ranks') return `url(#body-${abbr})`
        return getMemberCountColor(stateMemberCounts?.[name])
    }

    const describe = (name: string) => {
        if (mode === 'coalition')
            return (
                COALITION_BY_STATE.get(ABBR_BY_NAME.get(name) ?? '')?.name ??
                'No coalition'
            )
        if (mode === 'ranks') return rankFor(name).name
        return `${stateMemberCounts?.[name] ?? 0} members`
    }

    const legend =
        mode === 'coalition'
            ? COALITIONS.map(({ name, color }) => ({ name, swatch: color }))
            : mode === 'ranks'
              ? RANKS.map((rank) => ({
                    name: rank.name,
                    swatch: rankGradientCss(rank),
                }))
              : []

    return (
        <div className={styles.wrapper}>
            <div className={styles.modes} role="group" aria-label="Map mode">
                {MODES.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        className={cn(
                            styles.mode,
                            mode === id && styles.activeMode
                        )}
                        aria-pressed={mode === id}
                        onClick={() => setMode(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div
                className={cn(styles.grid, mode === 'ranks' && styles.metal)}
                style={{
                    aspectRatio: `${MAP_CANVAS.width} / ${MAP_CANVAS.height}`,
                }}
            >
                {STATE_SHAPES.map(
                    ({ name, abbr, path, x, y, width, height }) => {
                        const isSelected = selected === name
                        const fill = fillFor(name, abbr)
                        const rank =
                            mode === 'ranks' ? rankFor(name) : undefined

                        return (
                            <svg
                                key={name}
                                viewBox={`0 0 ${width} ${height}`}
                                preserveAspectRatio="none"
                                className={cn(
                                    styles.state,
                                    isSelected && styles.lifted
                                )}
                                style={
                                    {
                                        left: `${(x / MAP_CANVAS.width) * 100}%`,
                                        top: `${(y / MAP_CANVAS.height) * 100}%`,
                                        width: `${(width / MAP_CANVAS.width) * 100}%`,
                                        height: `${(height / MAP_CANVAS.height) * 100}%`,
                                        '--state-fill': fill,
                                        '--state-stroke': rank?.rimStops
                                            ? `url(#rim-${abbr})`
                                            : rank?.rim,
                                    } as CSSProperties
                                }
                            >
                                {rank && (
                                    <defs>
                                        {/* Both are anchored to the map, not the state, so the sheen is continuous across shapes. */}
                                        <linearGradient
                                            id={`sheen-${abbr}`}
                                            gradientUnits="userSpaceOnUse"
                                            x1="0"
                                            y1={-y}
                                            x2="0"
                                            y2={MAP_CANVAS.height - y}
                                        >
                                            {rank.stops.map(
                                                ({ offset, color }, index) => (
                                                    <stop
                                                        key={`${offset}-${index}`}
                                                        offset={`${offset * 100}%`}
                                                        stopColor={color}
                                                    />
                                                )
                                            )}
                                        </linearGradient>
                                        <linearGradient
                                            id={`body-${abbr}`}
                                            gradientUnits="userSpaceOnUse"
                                            x1={-x}
                                            y1={-y}
                                            x2={MAP_CANVAS.width - x}
                                            y2={MAP_CANVAS.height - y}
                                        >
                                            {(rank.bodyStops ?? rank.stops).map(
                                                ({ offset, color }, index) => (
                                                    <stop
                                                        key={`${offset}-${index}`}
                                                        offset={`${offset * 100}%`}
                                                        stopColor={color}
                                                    />
                                                )
                                            )}
                                        </linearGradient>
                                        <clipPath id={`clip-${abbr}`}>
                                            <path d={path} />
                                        </clipPath>
                                        {rank.rimStops && (
                                            <linearGradient
                                                id={`rim-${abbr}`}
                                                gradientUnits="userSpaceOnUse"
                                                x1="0"
                                                y1={-y}
                                                x2="0"
                                                y2={MAP_CANVAS.height - y}
                                            >
                                                {rank.rimStops.map(
                                                    (
                                                        { offset, color },
                                                        index
                                                    ) => (
                                                        <stop
                                                            key={`${offset}-${index}`}
                                                            offset={`${offset * 100}%`}
                                                            stopColor={color}
                                                        />
                                                    )
                                                )}
                                            </linearGradient>
                                        )}
                                        {rank.facets && (
                                            /* One square tile centered on the state, so every shape gets a single complete cut. */
                                            <pattern
                                                id={`facets-${abbr}`}
                                                patternUnits="userSpaceOnUse"
                                                viewBox={`0 0 ${FACET_TILE} ${FACET_TILE}`}
                                                x={
                                                    (width -
                                                        Math.max(
                                                            width,
                                                            height
                                                        )) /
                                                    2
                                                }
                                                y={
                                                    (height -
                                                        Math.max(
                                                            width,
                                                            height
                                                        )) /
                                                    2
                                                }
                                                width={Math.max(width, height)}
                                                height={Math.max(width, height)}
                                            >
                                                {rank.facets.map(
                                                    ({
                                                        points,
                                                        color,
                                                        opacity,
                                                    }) => (
                                                        <polygon
                                                            key={points}
                                                            points={points}
                                                            fill={color}
                                                            fillOpacity={
                                                                opacity
                                                            }
                                                            stroke="#FFFFFF"
                                                            strokeOpacity={0.45}
                                                            strokeWidth={0.9}
                                                        />
                                                    )
                                                )}
                                            </pattern>
                                        )}
                                    </defs>
                                )}

                                <path
                                    d={path}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={name}
                                    aria-pressed={isSelected}
                                    className={styles.shape}
                                    onPointerEnter={() => setHovered(name)}
                                    onPointerLeave={() => setHovered(null)}
                                    onFocus={() => setHovered(name)}
                                    onBlur={() => setHovered(null)}
                                    onClick={() => toggle(name)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key !== 'Enter' &&
                                            event.key !== ' '
                                        )
                                            return
                                        event.preventDefault()
                                        toggle(name)
                                    }}
                                >
                                    <title>{`${name} (${abbr})`}</title>
                                </path>

                                {rank?.facets && (
                                    <path
                                        d={path}
                                        className={styles.facets}
                                        fill={`url(#facets-${abbr})`}
                                        clipPath={`url(#clip-${abbr})`}
                                    />
                                )}

                                {rank && (
                                    /* Clipping a doubled stroke to the shape leaves only its inner half. */
                                    <path
                                        d={path}
                                        className={styles.insetBorder}
                                        stroke={`url(#sheen-${abbr})`}
                                        clipPath={`url(#clip-${abbr})`}
                                    />
                                )}
                            </svg>
                        )
                    }
                )}
            </div>

            <p className={styles.readout} aria-live="polite">
                {selected && (
                    <>
                        <span className={styles.selected}>{selected}</span>
                        {`: ${describe(selected)}`}
                    </>
                )}
                {!selected && hovered && (
                    <>
                        {hovered}
                        {`: ${describe(hovered)}`}
                    </>
                )}
                {!selected &&
                    !hovered &&
                    (mode === 'coalition'
                        ? 'Hover a state to see its coalition'
                        : mode === 'ranks'
                          ? 'Hover a state to see its rank'
                          : `Total Members: ${totalMemberCount ?? 0}`)}
            </p>

            {legend.length > 0 && (
                <ul className={styles.legend}>
                    {legend.map(({ name, swatch }) => (
                        <li key={name} className={styles.legendItem}>
                            <span
                                className={styles.swatch}
                                style={{ background: swatch }}
                            />
                            {name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
