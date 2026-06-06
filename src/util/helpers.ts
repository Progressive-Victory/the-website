import type { CSSProperties } from 'react'

export function areOverlayStylesEqual(
    a: CSSProperties,
    b: CSSProperties
): boolean {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<
        keyof CSSProperties
    >

    for (const key of keys) {
        if (a[key] !== b[key]) {
            return false
        }
    }

    return true
}
