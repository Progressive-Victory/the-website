export interface NiceScale {
    max: number
    step: number
    ticks: number[]
}

export interface PlotGeometry {
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

export function niceScale(
    maxValue: number,
    tickCount = 6,
    forceInteger = false
): NiceScale {
    if (!Number.isFinite(maxValue) || maxValue <= 0) {
        return {
            max: 1,
            step: forceInteger ? 1 : 0.25,
            ticks: [0, 0.25, 0.5, 0.75, 1],
        }
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
    for (let value = 0; value <= max + 1e-9; value += step) {
        ticks.push(value)
    }

    return { max: max > 0 ? max : 1, step, ticks }
}

export function getColumnCenter(
    geometry: PlotGeometry,
    idx: number,
    count: number
): number {
    return (
        geometry.plotLeft +
        ((idx + 0.5) / Math.max(count, 1)) * geometry.plotWidth
    )
}

export function roundRect(
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
