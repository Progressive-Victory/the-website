import { zIntQuery, zStringQuery } from '@/util'
import z from 'zod'

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export const zSearchRequest = z.object({
    page: zIntQuery.optional(),
    limit: zIntQuery,
    searchField: zStringQuery.optional(),
    sortField: zStringQuery.optional(),
    query: zStringQuery.optional(),
    sort: z.enum(SortDirection).default(SortDirection.DESC),
})

export type SearchRequest = z.infer<typeof zSearchRequest>
