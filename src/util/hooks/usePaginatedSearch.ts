import { useFetch } from './useFetch'
import { SearchRequest, SortDirection } from '@/contracts/requests'
import { PaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import {
    keepPreviousData,
    skipToken,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import z from 'zod'

export function usePaginatedSearch<T>(
    endpoint: string,
    schema: z.ZodObject,
    options?: {
        search?: SearchRequest
        all?: boolean
    }
) {
    const { ready, onGet } = useFetch()

    const [search, setSearch] = useState<SearchRequest>({
        ...(options?.search ?? {}),
        limit: options?.search?.limit,
        sort: options?.search?.sort,
    })

    interface Options {
        page?: number
        count?: number
        signal?: AbortSignal
    }

    const getPage = async (options: Options) => {
        const page = options?.page ?? search.page ?? 0
        const limit = options?.count
            ? Math.min(
                  search.limit ?? 25,
                  options.count - page * (search.limit ?? 25)
              )
            : search.limit

        const res = await onGet<PaginatedResponse<T>>(
            endpoint,
            zPaginatedResponse(schema),
            { query: { ...search, page, limit }, signal: options?.signal }
        )

        return res
    }

    const getAllPages = async (options: Options) => {
        const res = await getPage(options)
        const { data, count } = res

        const limit = search.limit
        const pageCount = Math.ceil(count / (limit ?? 25))

        const pageQueries: Promise<PaginatedResponse<T>>[] = []
        for (let page = 1; page < pageCount; page++)
            pageQueries.push(getPage({ ...options, page, count }))

        const pages = await Promise.all(pageQueries)
        data.push(...pages.flatMap((res) => res.data))

        return res
    }

    const getter = options?.all ? getAllPages : getPage

    const queryClient = useQueryClient()
    const query = useQuery({
        queryKey: [endpoint, search],
        queryFn: ready ? getter : skipToken,
        placeholderData: keepPreviousData,
    })

    const onSearch = (newSearch: SearchRequest) => {
        void queryClient.cancelQueries({
            queryKey: [endpoint, search],
        })
        setSearch(newSearch)
    }

    useEffect(() => {
        return () =>
            void queryClient.cancelQueries({
                queryKey: [endpoint, search],
            })
    }, [queryClient, endpoint, search])

    return { query, search, onSearch }
}
