import z from 'zod'
// import { $ZodShape } from 'zod/v4/core'

export function zPaginatedResponse<S extends z.ZodObject>(
    zData: S
) {
    return z.object({
        page: z.number(),
        limit: z.number(),
        count: z.number(),
        data: z.array(zData),
    })
}

export interface PaginatedResponse<T> {
    page: number
    limit: number
    count: number
    data: T[]
}
