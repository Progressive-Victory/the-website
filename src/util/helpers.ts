import type { CSSProperties } from 'react'

export function pascalToNormal(str: string): string {
    const pattern = /[a-z](?=[A-Z])/
    const pascalBounds: number[] = []

    for (let i = 0; i < str.length - 1; i++) {
        const sample = str.substring(i, i + 2)
        if (pattern.test(sample)) pascalBounds.push(i)
    }

    const slicedStr: string[] = []
    slicedStr.push(str.slice(0, pascalBounds[0] + 1))
    for (let i = 0; i < pascalBounds.length - 1; i++) {
        slicedStr.push(str.slice(pascalBounds[i] + 1, pascalBounds[i + 1] + 1))
    }
    slicedStr.push(str.slice(pascalBounds[pascalBounds.length - 1] + 1))

    return slicedStr.join(' ')
}

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

/**
 * Concatenates an array of class names into one valid HTML class name
 * @param classes List of values to evaluate and concatenate.
 * @example
 * cn("title", "widget", styles.container, true && "bold", false && "italic")
 * // output: "title widget page_container__00000 bold"
 * @example
 * // if you need to supply a falsy value as a valid class name, stringify it:
 * cn("myClass", 0, "false")
 * // output: "myClass false"
 */
export function cn(...classes: unknown[]) {
    return classes
        .filter((className) => className)
        .map((className) => String(className))
        .join(' ')
}
