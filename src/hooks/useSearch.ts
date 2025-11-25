import { useFetch } from './useFetch'
import { PaginatedResponse, SearchRequest } from '@/models'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export function useSearch<T>(endpoint: string, initialSearch?: SearchRequest) {
    const [search, setSearch] = useState(initialSearch)

    const { onGet } = useFetch()

    const { isPending, error, data } = useQuery({
        queryKey: [endpoint, search],
        async queryFn({ signal }) {
            if (!search) return null

            const url = new URL(location.href)
            url.pathname = endpoint

            for (const [key, values] of Object.entries(search.filters ?? {})) {
                for (const value of values) {
                    url.searchParams.set(key, value)
                }
            }

            if (search.page)
                url.searchParams.set('page', search.page?.toString())
            if (search.limit)
                url.searchParams.set('limit', search.limit?.toString())
            if (search.query) url.searchParams.set('query', search.query)
            if (search.field) url.searchParams.set('field', search.field)
            if (search.sort) url.searchParams.set('sort', search.sort)

            return await onGet<PaginatedResponse<T>>(url.toString(), signal)
        },
        placeholderData: keepPreviousData,
        enabled: !!search,
    })

    return { search, isPending, error, data: data ?? null, onSearch: setSearch }
}
