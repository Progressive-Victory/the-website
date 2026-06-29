import { SearchRequest, SortDirection } from '@/contracts/requests'
import { useMemo, useState } from 'react'

interface UseUnpaginatedSearchProps<T> {
    items: T[]
    initialSearch?: SearchRequest
    onFilter?: (a: T, query: string, field?: string) => boolean
    onSort?: (a: T, b: T, field?: string) => number
}

export function useUnpaginatedSearch<T>({
    items,
    initialSearch,
    onFilter,
    onSort,
}: UseUnpaginatedSearchProps<T>) {
    const [search, setSearch] = useState<SearchRequest>(initialSearch ?? {})

    const sortedItems = useMemo(() => {
        if (!onSort) return items

        if (search.sort == SortDirection.ASC)
            return items.sort((a, b) => onSort(a, b, search.sort))
        if (search.sort == SortDirection.DESC)
            return items.sort((a, b) => onSort(b, a, search.sort))

        return items
    }, [items, search, onSort])

    const filteredItems = useMemo(() => {
        if (!onFilter) return sortedItems

        return sortedItems.filter((a) =>
            onFilter(a, search.query ?? '', search.searchField)
        )
    }, [sortedItems, search, onFilter])

    const pagedItems = useMemo(() => {
        if (search.limit == null) return filteredItems

        const start = (search.page ?? 0) * search.limit
        return filteredItems.slice(start, start + search.limit)
    }, [filteredItems, search.page, search.limit])

    return {
        items: pagedItems,
        count: filteredItems.length,
        search,
        onSearch: setSearch,
    }
}
