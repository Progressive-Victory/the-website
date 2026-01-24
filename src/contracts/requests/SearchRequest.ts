import z from 'zod'

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export const zSearchRequest = z.object({
    page: z.int().optional(),
    limit: z.int(),
    field: z.string().optional(),
    query: z.string().optional(),
    sort: z.enum(SortDirection).optional(),
})

export type SearchRequest = z.infer<typeof zSearchRequest>
