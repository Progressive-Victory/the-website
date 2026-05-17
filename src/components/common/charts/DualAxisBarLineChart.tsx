'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import styles from './DualAxisBarLineChart.module.css'

export type ChartGranularity =
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'

export interface ChartPoint {
    key: string
    anchorIso?: string
    granularity?: ChartGranularity
    label?: string
    fullLabel: string
    primaryBarValue: number
    secondaryBarValue: number
    lineValue: number
}

interface DualAxisBarLineChartSeriesLabels {
    primaryBar: string
    secondaryBar: string
    line: string
}

interface DualAxisBarLineChartValueFormatters {
    primaryBar?: (value: number) => string
    secondaryBar?: (value: number) => string
    line?: (value: number) => string
}

interface DualAxisBarLineChartAxisFormatters {
    left?: (value: number, step: number) => string
    right?: (value: number, step: number) => string
}

interface DualAxisBarLineChartColors {
    primaryBar: string
    secondaryBar: string
    line: string
    lineFill: string
    linePointFill: string
    linePointStroke: string
}

interface DualAxisBarLineTableConfig {
    caption: string
    periodHeader: string
    primaryBarHeader: string
    secondaryBarHeader: string
    lineHeader: string
}

interface ChartProps {
    title?: string
    hint?: string
    points: ChartPoint[]
    smoothLine?: boolean
    showAreaFill?: boolean
    showLine?: boolean
    headerRight?: ReactNode
    seriesLabels?: Partial<DualAxisBarLineChartSeriesLabels>
    valueFormatters?: DualAxisBarLineChartValueFormatters
    axisFormatters?: DualAxisBarLineChartAxisFormatters
    colors?: Partial<DualAxisBarLineChartColors>
    ariaLabel?: string
    chartAriaLabel?: string
    tableConfig?: Partial<DualAxisBarLineTableConfig>
}

const DEFAULT_COLORS: DualAxisBarLineChartColors = {
    primaryBar: '#6d95d1',
    secondaryBar: '#7fb800',
    line: '#6b44c5',
    lineFill: 'rgba(107, 68, 197, 0.10)',
    linePointFill: '#8b6ad9',
    linePointStroke: '#5a35bc',
}

const COLOR_GRID = 'rgba(15, 23, 42, 0.10)'
const COLOR_AXIS_TEXT = 'rgba(15, 23, 42, 0.48)'
const COLOR_X_LABEL = 'rgba(15, 23, 42, 0.6)'
const COLOR_YEAR_DIVIDER = 'rgba(15, 23, 42, 0.32)'
const COLOR_YEAR_LABEL_BG = 'rgba(15, 23, 42, 0.06)'
const COLOR_YEAR_LABEL = 'rgba(15, 23, 42, 0.55)'
const COLOR_HOVER_BAND = 'rgba(107, 68, 197, 0.08)'

const PADDING_LEFT = 56
const PADDING_RIGHT = 52
const PADDING_TOP = 12
const PADDING_BOTTOM = 26
const BAR_GAP = 2
const BAR_MAX_WIDTH = 18
const BAR_MIN_WIDTH = 2
const GROUP_GAP_RATIO = 0.28

function formatCount(value: number): string {
    if (!Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US')
}

function formatCountAxis(value: number): string {
    if (!Number.isFinite(value)) return ''
    const rounded = Math.round(value)
    if (rounded >= 1_000_000) {
        return `${(rounded / 1_000_000).toLocaleString('en-US', {
            maximumFractionDigits: 1,
        })}M`
    }
    if (rounded >= 10_000) {
        return `${Math.round(rounded / 1000).toLocaleString('en-US')}k`
    }
    return rounded.toLocaleString('en-US')
}

function niceScale(maxValue: number, tickCount = 6, forceInteger = false) {
    if (!Number.isFinite(maxValue) || maxValue <= 0) {
        return { max: 1, step: forceInteger ? 1 : 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] }
    }
    const safe = Math.max(2, tickCount)
    const rawStep = maxValue / (safe - 1)
    const magnitude = 10 ** Math.floor(Math.log10(rawStep))
    const normalized = rawStep / magnitude
    let nice = 10
    if (normalized <= 1) nice = 1
    else if (normalized <= 2) nice = 2
    else if (normalized <= 2.5) nice = 2.5
    else if (normalized <= 5) nice = 5
    let step = nice * magnitude
    if (forceInteger) step = Math.max(1, Math.ceil(step))
    const max = Math.ceil(maxValue / step) * step
    const ticks: number[] = []
    for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v)
    return { max: max > 0 ? max : 1, step, ticks }
}

function formatHour(date: Date, includeMinute = false): string {
    const hours = date.getHours()
    const suffix = hours >= 12 ? 'pm' : 'am'
    const display = hours % 12 === 0 ? 12 : hours % 12
    if (includeMinute) {
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${display}:${minutes}${suffix}`
    }
    return `${display}${suffix}`
}

function pickLabel(
    granularity: ChartGranularity,
    date: Date,
    spansYears: boolean,
    perColumnWidth: number,
    idx: number,
    stride: number,
    totalCount: number
): string {
    const widthsByG: Record<ChartGranularity, [number, number, number]> = {
        year: [60, 40, 24],
        quarter: [74, 48, 30],
        month: [78, 44, 26],
        week: [90, 56, 38],
        day: [98, 62, 38],
        hour: [62, 36, 24],
    }
    const widths = widthsByG[granularity]
    let level: 0 | 1 | 2 | 3
    if (perColumnWidth >= widths[0]) level = 0
    else if (perColumnWidth >= widths[1]) level = 1
    else if (perColumnWidth >= widths[2]) level = 2
    else level = 3

    if (granularity === 'year') {
        if (level <= 1)
            return date.toLocaleDateString('en-US', { year: 'numeric' })
        if (level === 2)
            return date
                .toLocaleDateString('en-US', { year: '2-digit' })
                .replace(/^/, "'")
        return idx % stride === 0
            ? date
                  .toLocaleDateString('en-US', { year: '2-digit' })
                  .replace(/^/, "'")
            : ''
    }
    if (granularity === 'month') {
        const isFirst = idx === 0
        const isLast = idx === totalCount - 1
        const isQuarterStart = date.getMonth() % 3 === 0

        if (level === 0)
            return date.toLocaleDateString('en-US', {
                month: 'long',
                ...(spansYears ? { year: 'numeric' } : {}),
            })
        if (level === 1)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                ...(spansYears ? { year: '2-digit' } : {}),
            })
        if (level === 2) {
            return date.toLocaleDateString('en-US', { month: 'short' })
        }
        if (isFirst || isLast || isQuarterStart) {
            return date.toLocaleDateString('en-US', { month: 'short' })
        }
        return ''
    }
    if (granularity === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        const yearFull = date.getFullYear()
        const yearShort = String(yearFull).slice(-2)

        if (level === 0) return `Q${quarter} ${yearFull}`
        if (level === 1) return `Q${quarter} '${yearShort}`
        if (level === 2) return `Q${quarter}`
        return idx % stride === 0 ? `Q${quarter}` : ''
    }
    if (granularity === 'week') {
        if (level === 0)
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        if (level === 1)
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (level === 2)
            return date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            })
        return idx % stride === 0
            ? date.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
              })
            : ''
    }
    if (granularity === 'day') {
        if (level === 0)
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })
        if (level === 1)
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (level === 2)
            return date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            })
        return idx % stride === 0
            ? date.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
              })
            : ''
    }
    if (level === 0) return formatHour(date, true)
    if (level === 1) return formatHour(date)
    if (level === 2) return idx % 2 === 0 ? formatHour(date) : ''
    return idx % stride === 0 ? formatHour(date) : ''
}

interface PlotGeometry {
    width: number
    height: number
    plotLeft: number
    plotRight: number
    plotTop: number
    plotBottom: number
    plotWidth: number
    plotHeight: number
    columnWidth: number
}

function getColumnCenter(geom: PlotGeometry, idx: number, count: number): number {
    return geom.plotLeft + ((idx + 0.5) / Math.max(count, 1)) * geom.plotWidth
}

export function Chart({
    title = 'Chart',
    hint,
    points,
    smoothLine = true,
    showAreaFill = true,
    showLine = true,
    headerRight,
    seriesLabels,
    valueFormatters,
    axisFormatters,
    colors,
    ariaLabel,
    chartAriaLabel,
    tableConfig,
}: ChartProps) {
    const labels: DualAxisBarLineChartSeriesLabels = {
        primaryBar: seriesLabels?.primaryBar ?? 'Primary Series',
        secondaryBar: seriesLabels?.secondaryBar ?? 'Secondary Series',
        line: seriesLabels?.line ?? 'Line Series',
    }

    const palette = useMemo<DualAxisBarLineChartColors>(
        () => ({
            ...DEFAULT_COLORS,
            ...colors,
        }),
        [colors]
    )

    const tooltipFormatPrimary = valueFormatters?.primaryBar ?? formatCount
    const tooltipFormatSecondary = valueFormatters?.secondaryBar ?? formatCount
    const tooltipFormatLine = valueFormatters?.line ?? formatCount
    const leftAxisFormatter = axisFormatters?.left ?? formatCountAxis
    const rightAxisFormatter = axisFormatters?.right ?? formatCountAxis

    const table: DualAxisBarLineTableConfig = {
        caption: tableConfig?.caption ?? `${title} by period`,
        periodHeader: tableConfig?.periodHeader ?? 'Period',
        primaryBarHeader: tableConfig?.primaryBarHeader ?? labels.primaryBar,
        secondaryBarHeader: tableConfig?.secondaryBarHeader ?? labels.secondaryBar,
        lineHeader: tableConfig?.lineHeader ?? labels.line,
    }

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const wrapRef = useRef<HTMLDivElement | null>(null)
    const tooltipRef = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
    const [tooltipSide, setTooltipSide] = useState<'left' | 'right'>('left')

    useEffect(() => {
        const node = wrapRef.current
        if (!node) return

        const update = () => {
            const rect = node.getBoundingClientRect()
            setSize((prev) => {
                if (
                    Math.abs(prev.width - rect.width) < 0.5 &&
                    Math.abs(prev.height - rect.height) < 0.5
                ) {
                    return prev
                }
                return { width: rect.width, height: rect.height }
            })
        }

        update()

        let observer: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(update)
            observer.observe(node)
        }
        window.addEventListener('resize', update)
        return () => {
            observer?.disconnect()
            window.removeEventListener('resize', update)
        }
    }, [])

    useLayoutEffect(() => {
        if (hoverIdx == null || !hoverPos) {
            setTooltipPos(null)
            return
        }

        const wrapNode = wrapRef.current
        const tooltipNode = tooltipRef.current
        if (!wrapNode || !tooltipNode) return

        const padding = 8
        const wrapRect = wrapNode.getBoundingClientRect()
        const tooltipRect = tooltipNode.getBoundingClientRect()

        const leftSpace = hoverPos.x - padding
        const rightSpace = wrapRect.width - hoverPos.x - padding
        const shouldFlipRight =
            leftSpace < tooltipRect.width + 12 && rightSpace > leftSpace

        const side: 'left' | 'right' = shouldFlipRight ? 'right' : 'left'
        const x = side === 'right'
            ? Math.min(hoverPos.x + 12, wrapRect.width - tooltipRect.width - padding)
            : Math.max(hoverPos.x - 12, tooltipRect.width + padding)
        const y = Math.min(
            Math.max(hoverPos.y, padding),
            wrapRect.height - tooltipRect.height - padding
        )

        setTooltipPos((prev) => {
            if (prev && Math.abs(prev.x - x) < 0.5 && Math.abs(prev.y - y) < 0.5) {
                setTooltipSide((prevSide) => (prevSide === side ? prevSide : side))
                return prev
            }
            setTooltipSide(side)
            return { x, y }
        })
    }, [hoverIdx, hoverPos, size])

    const barScale = useMemo(() => {
        const max = Math.max(
            ...points.map((p) => Math.max(p.primaryBarValue, p.secondaryBarValue)),
            0
        )
        return niceScale(Math.max(max, 5), 6, false)
    }, [points])

    const lineScale = useMemo(() => {
        const max = Math.max(...points.map((p) => p.lineValue), 0)
        return niceScale(Math.max(max, 5), 6, true)
    }, [points])

    const geometry = useMemo<PlotGeometry>(() => {
        const width = size.width
        const height = size.height
        const plotLeft = PADDING_LEFT
        const plotRight = width - PADDING_RIGHT
        const plotTop = PADDING_TOP
        const plotBottom = height - PADDING_BOTTOM
        const plotWidth = Math.max(0, plotRight - plotLeft)
        const plotHeight = Math.max(0, plotBottom - plotTop)
        const columnWidth = plotWidth / Math.max(points.length, 1)
        return {
            width,
            height,
            plotLeft,
            plotRight,
            plotTop,
            plotBottom,
            plotWidth,
            plotHeight,
            columnWidth,
        }
    }, [size, points.length])

    const yearDividers = useMemo(() => {
        const out: { idx: number; year: number }[] = []
        for (let i = 1; i < points.length; i += 1) {
            const prev = points[i - 1].anchorIso
            const curr = points[i].anchorIso
            if (!prev || !curr) continue
            const prevY = new Date(prev).getFullYear()
            const currY = new Date(curr).getFullYear()
            if (prevY !== currY) out.push({ idx: i, year: currY })
        }
        return out
    }, [points])

    const spansYears = useMemo(() => {
        if (points.length < 2) return false
        const firstIso = points[0].anchorIso
        const lastIso = points[points.length - 1].anchorIso
        if (!firstIso || !lastIso) return false
        return (
            new Date(firstIso).getFullYear() !==
            new Date(lastIso).getFullYear()
        )
    }, [points])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const { width, height } = size
        if (width <= 0 || height <= 0) return

        const dpr = Math.min(window.devicePixelRatio || 1, 3)
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)

        const g = geometry
        if (g.plotWidth <= 0 || g.plotHeight <= 0) return

        const fontFamily =
            getComputedStyle(canvas).fontFamily ||
            'system-ui, -apple-system, sans-serif'

        ctx.lineWidth = 1
        ctx.strokeStyle = COLOR_GRID
        ctx.fillStyle = COLOR_AXIS_TEXT
        ctx.font = `700 10px ${fontFamily}`
        ctx.textBaseline = 'middle'

        const barTicks = barScale.ticks
        for (const tick of barTicks) {
            const y = Math.round(
                g.plotBottom - (tick / barScale.max) * g.plotHeight
            ) + 0.5
            ctx.beginPath()
            ctx.moveTo(g.plotLeft, y)
            ctx.lineTo(g.plotRight, y)
            ctx.stroke()

            ctx.textAlign = 'right'
            ctx.fillText(
                leftAxisFormatter(tick, barScale.step),
                g.plotLeft - 8,
                y
            )
        }

        if (showLine) {
            for (const tick of barTicks) {
                const ratio = tick / barScale.max
                const y = Math.round(g.plotBottom - ratio * g.plotHeight) + 0.5
                const lineValue = ratio * lineScale.max
                ctx.textAlign = 'left'
                ctx.fillText(rightAxisFormatter(lineValue, lineScale.step), g.plotRight + 8, y)
            }
        }

        ctx.save()
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = COLOR_YEAR_DIVIDER
        ctx.lineWidth = 1
        yearDividers.forEach((d) => {
            const x =
                Math.round(g.plotLeft + (d.idx / points.length) * g.plotWidth) + 0.5
            ctx.beginPath()
            ctx.moveTo(x, g.plotTop)
            ctx.lineTo(x, g.plotBottom)
            ctx.stroke()
        })
        ctx.restore()

        ctx.font = `700 9px ${fontFamily}`
        yearDividers.forEach((d) => {
            const x = g.plotLeft + (d.idx / points.length) * g.plotWidth
            const label = String(d.year)
            const padX = 4
            const padY = 2
            const metrics = ctx.measureText(label)
            const w = metrics.width + padX * 2
            const h = 12
            const bx = Math.round(x + 4)
            const by = g.plotTop + 4
            ctx.fillStyle = COLOR_YEAR_LABEL_BG
            roundRect(ctx, bx, by, w, h, 3)
            ctx.fill()
            ctx.fillStyle = COLOR_YEAR_LABEL
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, bx + padX, by + h / 2 + padY * 0)
        })

        if (hoverIdx != null && hoverIdx >= 0 && hoverIdx < points.length) {
            const cx = getColumnCenter(g, hoverIdx, points.length)
            const bandW = g.columnWidth
            ctx.fillStyle = COLOR_HOVER_BAND
            ctx.fillRect(cx - bandW / 2, g.plotTop, bandW, g.plotHeight)
        }

        const groupAvailable = Math.max(0, g.columnWidth * (1 - GROUP_GAP_RATIO))
        const barWidth = Math.max(
            BAR_MIN_WIDTH,
            Math.min(BAR_MAX_WIDTH, (groupAvailable - BAR_GAP) / 2)
        )

        for (let i = 0; i < points.length; i += 1) {
            const p = points[i]
            const cx = getColumnCenter(g, i, points.length)
            const primaryRatio =
                barScale.max > 0 ? p.primaryBarValue / barScale.max : 0
            const secondaryRatio =
                barScale.max > 0 ? p.secondaryBarValue / barScale.max : 0
            const primaryHeight = Math.max(
                p.primaryBarValue > 0 ? 2 : 0,
                primaryRatio * g.plotHeight
            )
            const secondaryHeight = Math.max(
                p.secondaryBarValue > 0 ? 2 : 0,
                secondaryRatio * g.plotHeight
            )

            const primaryX = cx - barWidth - BAR_GAP / 2
            const secondaryX = cx + BAR_GAP / 2
            const baseY = g.plotBottom

            ctx.fillStyle = palette.primaryBar
            roundRect(
                ctx,
                primaryX,
                baseY - primaryHeight,
                barWidth,
                primaryHeight,
                Math.min(3, barWidth / 2),
                true
            )
            ctx.fill()

            ctx.fillStyle = palette.secondaryBar
            roundRect(
                ctx,
                secondaryX,
                baseY - secondaryHeight,
                barWidth,
                secondaryHeight,
                Math.min(3, barWidth / 2),
                true
            )
            ctx.fill()
        }

        if (showLine && points.length > 0 && lineScale.max > 0) {
            const linePts = points.map((p, i) => {
                const ratio = p.lineValue / lineScale.max
                return {
                    x: getColumnCenter(g, i, points.length),
                    y: g.plotBottom - ratio * g.plotHeight,
                }
            })

            if (showAreaFill) {
                ctx.beginPath()
                ctx.moveTo(linePts[0].x, g.plotBottom)
                ctx.lineTo(linePts[0].x, linePts[0].y)
                for (let i = 1; i < linePts.length; i += 1) {
                    const prev = linePts[i - 1]
                    const curr = linePts[i]
                    if (smoothLine) {
                        const mx = (prev.x + curr.x) / 2
                        ctx.bezierCurveTo(mx, prev.y, mx, curr.y, curr.x, curr.y)
                    } else {
                        ctx.lineTo(curr.x, curr.y)
                    }
                }
                ctx.lineTo(linePts[linePts.length - 1].x, g.plotBottom)
                ctx.closePath()
                ctx.fillStyle = palette.lineFill
                ctx.fill()
            }

            ctx.beginPath()
            ctx.moveTo(linePts[0].x, linePts[0].y)
            for (let i = 1; i < linePts.length; i += 1) {
                const prev = linePts[i - 1]
                const curr = linePts[i]
                if (smoothLine) {
                    const mx = (prev.x + curr.x) / 2
                    ctx.bezierCurveTo(mx, prev.y, mx, curr.y, curr.x, curr.y)
                } else {
                    ctx.lineTo(curr.x, curr.y)
                }
            }
            ctx.strokeStyle = palette.line
            ctx.lineWidth = 2.4
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.stroke()

            for (let i = 0; i < linePts.length; i += 1) {
                const pt = linePts[i]
                const r = i === hoverIdx ? 4.5 : 3.2
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
                ctx.fillStyle = palette.linePointFill
                ctx.fill()
                ctx.lineWidth = 1
                ctx.strokeStyle = palette.linePointStroke
                ctx.stroke()
            }
        }

        ctx.font = `760 10px ${fontFamily}`
        ctx.fillStyle = COLOR_X_LABEL
        ctx.textBaseline = 'top'
        const stride = Math.max(1, Math.ceil(32 / Math.max(g.columnWidth, 1)))
        const labelCandidates: {
            idx: number
            text: string
            x: number
            align: CanvasTextAlign
            left: number
            right: number
        }[] = []

        for (let i = 0; i < points.length; i += 1) {
            const p = points[i]
            const cx = getColumnCenter(g, i, points.length)
            const isEnd = i === 0 || i === points.length - 1
            let label: string
            if (p.anchorIso && p.granularity) {
                const date = new Date(p.anchorIso)
                label = pickLabel(
                    p.granularity,
                    date,
                    spansYears,
                    g.columnWidth,
                    i,
                    stride,
                    points.length
                )
                if (!label && isEnd) {
                    if (p.granularity === 'year')
                        label = date.toLocaleDateString('en-US', {
                            year: 'numeric',
                        })
                    else if (p.granularity === 'month')
                        label = date.toLocaleDateString('en-US', {
                            month: 'short',
                        })
                    else if (p.granularity === 'quarter')
                        label = `Q${Math.floor(date.getMonth() / 3) + 1}`
                    else if (p.granularity === 'hour')
                        label = formatHour(date)
                    else
                        label = date.toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                        })
                }
            } else {
                label =
                    isEnd || i % stride === 0 ? (p.label ?? '') : ''
            }
            if (!label) continue

            let align: CanvasTextAlign = 'center'
            if (i === 0) align = 'left'
            else if (i === points.length - 1) align = 'right'

            let lx = cx
            if (i === 0) lx = Math.max(cx - g.columnWidth / 2, g.plotLeft)
            else if (i === points.length - 1)
                lx = Math.min(cx + g.columnWidth / 2, g.plotRight)

            const width = ctx.measureText(label).width
            let left = lx - width / 2
            let right = lx + width / 2
            if (align === 'left') {
                left = lx
                right = lx + width
            } else if (align === 'right') {
                left = lx - width
                right = lx
            }

            labelCandidates.push({
                idx: i,
                text: label,
                x: lx,
                align,
                left,
                right,
            })
        }

        const placedRanges: { left: number; right: number }[] = []
        const placementPadding = 6

        const placeLabel = (
            candidate: (typeof labelCandidates)[number],
            force = false
        ) => {
            const candidateLeft = candidate.left - placementPadding
            const candidateRight = candidate.right + placementPadding
            const overlaps = placedRanges.some(
                (range) =>
                    candidateLeft <= range.right &&
                    candidateRight >= range.left
            )

            if (overlaps && !force) return

            ctx.textAlign = candidate.align
            ctx.fillText(candidate.text, candidate.x, g.plotBottom + 6)
            placedRanges.push({ left: candidateLeft, right: candidateRight })
        }

        const firstIdx = 0
        const lastIdx = points.length - 1
        const firstCandidate = labelCandidates.find((c) => c.idx === firstIdx)
        const lastCandidate = labelCandidates.find((c) => c.idx === lastIdx)

        if (firstCandidate) placeLabel(firstCandidate, true)
        if (lastCandidate && lastCandidate !== firstCandidate)
            placeLabel(lastCandidate, true)

        for (const candidate of labelCandidates) {
            if (candidate.idx === firstIdx || candidate.idx === lastIdx) continue
            placeLabel(candidate)
        }
    }, [
        size,
        geometry,
        points,
        barScale,
        lineScale,
        yearDividers,
        spansYears,
        hoverIdx,
        smoothLine,
        showAreaFill,
        showLine,
        leftAxisFormatter,
        rightAxisFormatter,
        palette,
    ])

    function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const g = geometry
        if (
            x < g.plotLeft ||
            x > g.plotRight ||
            y < g.plotTop ||
            y > g.plotBottom ||
            points.length === 0
        ) {
            if (hoverIdx !== null) setHoverIdx(null)
            return
        }
        const ratio = (x - g.plotLeft) / g.plotWidth
        const idx = Math.min(
            points.length - 1,
            Math.max(0, Math.floor(ratio * points.length))
        )
        setHoverIdx(idx)
        const cx = getColumnCenter(g, idx, points.length)
        setHoverPos({ x: cx, y })
    }

    function onPointerLeave() {
        setHoverIdx(null)
    }

    const hoverPoint = hoverIdx != null ? points[hoverIdx] : null

    return (
        <section
            className={styles.chart}
            aria-label={ariaLabel ?? `${title} chart`}
        >
            <div className={styles.headerRow}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.headerRight}>
                    {headerRight ?? (hint ? <span className={styles.hint}>{hint}</span> : null)}
                </div>
            </div>

            <div className={styles.legend}>
                <span className={styles.legendItem}>
                    <span
                        className={styles.swatch}
                        style={{ background: palette.primaryBar }}
                        aria-hidden="true"
                    />
                    {labels.primaryBar}
                </span>
                <span className={styles.legendItem}>
                    <span
                        className={styles.swatch}
                        style={{ background: palette.secondaryBar }}
                        aria-hidden="true"
                    />
                    {labels.secondaryBar}
                </span>
                {showLine && (
                    <span className={styles.legendItem}>
                        <span
                            className={`${styles.swatch} ${styles.lineSwatch}`}
                            style={{ background: palette.line }}
                            aria-hidden="true"
                        />
                        {labels.line}
                    </span>
                )}
            </div>

            <div ref={wrapRef} className={styles.canvasWrap}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    role="img"
                    aria-label={chartAriaLabel ?? `${title} across ${points.length} periods`}
                    onPointerMove={onPointerMove}
                    onPointerLeave={onPointerLeave}
                />

                {hoverPoint && hoverPos && (
                    <div
                        ref={tooltipRef}
                        className={`${styles.tooltip} ${styles.tooltipVisible} ${
                            tooltipSide === 'right' ? styles.tooltipRight : ''
                        }`}
                        style={{
                            left: `${tooltipPos?.x ?? hoverPos.x}px`,
                            top: `${tooltipPos?.y ?? hoverPos.y}px`,
                        }}
                        role="tooltip"
                    >
                        <div className={styles.tooltipLabel}>
                            {hoverPoint.fullLabel}
                        </div>
                        <div className={styles.tooltipRow}>
                            <span
                                className={styles.tooltipDot}
                                style={{ background: palette.primaryBar }}
                                aria-hidden="true"
                            />
                            {labels.primaryBar}: {tooltipFormatPrimary(hoverPoint.primaryBarValue)}
                        </div>
                        <div className={styles.tooltipRow}>
                            <span
                                className={styles.tooltipDot}
                                style={{ background: palette.secondaryBar }}
                                aria-hidden="true"
                            />
                            {labels.secondaryBar}: {tooltipFormatSecondary(hoverPoint.secondaryBarValue)}
                        </div>
                        {showLine && (
                            <div className={styles.tooltipRow}>
                                <span
                                    className={styles.tooltipDot}
                                    style={{ background: palette.line }}
                                    aria-hidden="true"
                                />
                                {labels.line}: {tooltipFormatLine(hoverPoint.lineValue)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <table className={styles.srOnly}>
                <caption>{table.caption}</caption>
                <thead>
                    <tr>
                        <th scope="col">{table.periodHeader}</th>
                        <th scope="col">{table.primaryBarHeader}</th>
                        <th scope="col">{table.secondaryBarHeader}</th>
                        <th scope="col">{table.lineHeader}</th>
                    </tr>
                </thead>
                <tbody>
                    {points.map((p) => (
                        <tr key={p.key}>
                            <th scope="row">{p.fullLabel}</th>
                            <td>{tooltipFormatPrimary(p.primaryBarValue)}</td>
                            <td>{tooltipFormatSecondary(p.secondaryBarValue)}</td>
                            <td>{tooltipFormatLine(p.lineValue)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    topOnly = false
) {
    const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    if (topOnly) {
        ctx.lineTo(x + w, y + h)
        ctx.lineTo(x, y + h)
    } else {
        ctx.lineTo(x + w, y + h - radius)
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
        ctx.lineTo(x + radius, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    }
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}