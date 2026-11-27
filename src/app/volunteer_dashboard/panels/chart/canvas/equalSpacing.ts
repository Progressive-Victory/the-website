export interface SpacingGuide {
    axis: 'x' | 'y'
    start: number
    end: number
    cross: number
}

export interface Box {
    x: number
    y: number
    width: number
    height: number
}

interface Span {
    start: number
    end: number
}

const span = (box: Box, axis: 'x' | 'y'): Span =>
    axis === 'x'
        ? { start: box.x, end: box.x + box.width }
        : { start: box.y, end: box.y + box.height }

const crossAxis = (axis: 'x' | 'y') => (axis === 'x' ? 'y' : 'x')

const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end

const center = ({ start, end }: Span) => (start + end) / 2

const EQUAL = 0.5

// Boxes sharing the selection's row (for x) or column (for y), with the neighbours on each side.
function lineUp(selection: Box, others: Box[], axis: 'x' | 'y') {
    const selected = span(selection, axis)
    const row = others.filter((box) =>
        overlaps(span(box, crossAxis(axis)), span(selection, crossAxis(axis)))
    )
    const before = row
        .filter((box) => span(box, axis).end <= selected.start + EQUAL)
        .sort((a, b) => span(b, axis).end - span(a, axis).end)[0]
    const after = row
        .filter((box) => span(box, axis).start >= selected.end - EQUAL)
        .sort((a, b) => span(a, axis).start - span(b, axis).start)[0]
    const pairs: [Box, Box][] = []
    for (const box of row) {
        const end = span(box, axis).end
        const next = row
            .filter((other) => span(other, axis).start >= end)
            .sort((a, b) => span(a, axis).start - span(b, axis).start)[0]
        if (
            next &&
            !(
                center(selected) > end &&
                center(selected) < span(next, axis).start
            )
        )
            pairs.push([box, next])
    }
    return { before, after, pairs }
}

const gapBetween = (a: Box, b: Box, axis: 'x' | 'y') =>
    span(b, axis).start - span(a, axis).end

export function findEqualSpacing(
    selection: Box,
    others: Box[],
    axis: 'x' | 'y',
    radius: number
): { delta: number; gap: number } | undefined {
    const selected = span(selection, axis)
    const { before, after, pairs } = lineUp(selection, others, axis)
    const gaps = pairs
        .map(([a, b]) => gapBetween(a, b, axis))
        .filter((gap) => gap > 0)
    const candidates: { delta: number; gap: number }[] = []
    for (const gap of gaps) {
        if (before)
            candidates.push({
                delta: span(before, axis).end + gap - selected.start,
                gap,
            })
        if (after)
            candidates.push({
                delta: span(after, axis).start - gap - selected.end,
                gap,
            })
    }
    if (before && after) {
        const free =
            span(after, axis).start -
            span(before, axis).end -
            (selected.end - selected.start)
        if (free > 0)
            candidates.push({
                delta: span(before, axis).end + free / 2 - selected.start,
                gap: free / 2,
            })
    }
    return candidates
        .filter(({ delta }) => Math.abs(delta) <= radius)
        .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0]
}

export function equalSpacingGuides(
    selection: Box,
    others: Box[],
    axis: 'x' | 'y',
    gap: number
): SpacingGuide[] {
    const { before, after, pairs } = lineUp(selection, others, axis)
    const segment = (a: Box, b: Box): SpacingGuide => {
        const crossA = span(a, crossAxis(axis))
        const crossB = span(b, crossAxis(axis))
        return {
            axis,
            start: span(a, axis).end,
            end: span(b, axis).start,
            cross:
                (Math.max(crossA.start, crossB.start) +
                    Math.min(crossA.end, crossB.end)) /
                2,
        }
    }
    const equal = (a: Box, b: Box) =>
        Math.abs(gapBetween(a, b, axis) - gap) < EQUAL
    return [
        ...(before && equal(before, selection)
            ? [segment(before, selection)]
            : []),
        ...(after && equal(selection, after)
            ? [segment(selection, after)]
            : []),
        ...pairs.filter(([a, b]) => equal(a, b)).map(([a, b]) => segment(a, b)),
    ]
}
