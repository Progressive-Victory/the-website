'use client'

import type { Line } from '../domain/chart.types'
import { childLines, parentLines } from '../domain/lineGraph'
import { highlightedLineZIndex, lineZIndex } from './positionsToGraph'
import type { Edge } from '@xyflow/react'
import { useCallback, useMemo, useState } from 'react'

interface ChartEdgesOptions {
    graphEdges: Edge[]
    lines: Line[]
    selectedEdges: ReadonlySet<string>
    selectedLineId?: string
}

export function useChartEdges({
    graphEdges,
    lines,
    selectedEdges,
    selectedLineId,
}: ChartEdgesOptions) {
    const [hoveredLineId, setHoveredLineId] = useState<string | null>(null)
    const edges = useMemo(() => {
        const directSelection = selectedLineId
            ? new Set([selectedLineId])
            : new Set(selectedEdges)
        const byId = new Map(lines.map((line) => [line.id, line]))
        const children = new Map<string, string[]>()
        for (const line of lines) {
            children.set(
                line.id,
                childLines(line, lines).map(({ id }) => id)
            )
        }
        const relatedLines = (roots: ReadonlySet<string>) => {
            const highlighted = new Set<string>()
            for (const id of roots) {
                let current = byId.get(id)
                const pendingParents = current ? [current] : []
                while (pendingParents.length) {
                    current = pendingParents.pop()!
                    if (highlighted.has(current.id)) continue
                    highlighted.add(current.id)
                    pendingParents.push(...parentLines(current, lines))
                }
            }
            const downstream = new Set<string>()
            const pending = [...roots]
            while (pending.length) {
                const id = pending.pop()!
                if (downstream.has(id)) continue
                downstream.add(id)
                highlighted.add(id)
                pending.push(...(children.get(id) ?? []))
            }
            return highlighted
        }
        const highlighted = relatedLines(directSelection)
        const hovered = relatedLines(
            new Set(hoveredLineId ? [hoveredLineId] : [])
        )
        return graphEdges.map((edge) => ({
            ...edge,
            data: {
                ...edge.data,
                directlySelected: directSelection.has(edge.id),
                hitboxHovered: hovered.has(edge.id),
            },
            selected: highlighted.has(edge.id),
            zIndex: highlighted.has(edge.id)
                ? highlightedLineZIndex
                : lineZIndex,
        }))
    }, [graphEdges, lines, selectedEdges, selectedLineId, hoveredLineId])

    const onMouseEnter = useCallback((id: string) => {
        setHoveredLineId(id)
    }, [])
    const onMouseLeave = useCallback((id: string) => {
        setHoveredLineId((current) => (current === id ? null : current))
    }, [])

    return { edges, onMouseEnter, onMouseLeave }
}
