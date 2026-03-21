import { zEnumQuery, zIntQuery, zStringQuery } from '@/util'
import z from 'zod'

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export const zSearchRequest = z.object({
    page: zIntQuery,
    limit: zIntQuery,
    searchField: zStringQuery,
    sortField: zStringQuery,
    query: zStringQuery,
    sort: zEnumQuery(SortDirection),
})

export type SearchRequest = z.infer<typeof zSearchRequest>
