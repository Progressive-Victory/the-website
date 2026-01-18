import { useFetch } from './useFetch'
import { SearchRequest } from '@/contracts/requests'
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
    initialSearch?: SearchRequest
) {
    const { ready, onGet } = useFetch()

    const [search, setSearch] = useState<SearchRequest>({
        ...initialSearch,
        limit: initialSearch?.limit ?? 25,
    })

    const queryClient = useQueryClient()
    const query = useQuery({
        queryKey: [endpoint, search],
        queryFn: ready
            ? ({ signal }) =>
                  onGet<PaginatedResponse<T>>(
                      endpoint,
                      zPaginatedResponse(schema),
                      { query: search, signal }
                  )
            : skipToken,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        return () =>
            void queryClient.cancelQueries({
                queryKey: [endpoint, search],
            })
    }, [queryClient, endpoint, search])

    return { query, search, onSearch: setSearch }
}
