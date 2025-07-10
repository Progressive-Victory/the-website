/**
 * Attempts to parse a string into a number within some range or returns the
 * provided default value (or 0)
 */

export function parseNumber(
    value: string | null,
    options?: {
        default?: number
        min?: number
        max?: number
    }
) {
    const def = options?.default ?? 0

    if (value == null) return def

    const n = parseInt(value)
    let v = isNaN(n) ? def : n

    if (options?.min != null) v = Math.max(v, options?.min)
    if (options?.max != null) v = Math.min(v, options?.max)

    return v
}

/**
 * Parses pagination paramters from the provided URL and returns the params for
 * further filtering usage
 */
export function parsePaginationParams(url: string | URL) {
    const u = typeof url === 'string' ? new URL(url) : url

    const page = parseNumber(u.searchParams.get('page'), {
        default: 0,
        min: 0,
    })
    const limit = parseNumber(u.searchParams.get('limit'), {
        default: 12,
        min: 0,
        max: 100,
    })
    const skip = page * limit

    return {
        page,
        limit,
        skip,
        params: u.searchParams,
    }
}
