import { useCallback, useEffect, useState } from 'react'

export interface UseInfiniteScrollOptions {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    fetchNextPage: () => unknown
    rootMargin?: string
}

export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin = '300px',
}: UseInfiniteScrollOptions) {
    const [sentinel, setSentinel] = useState<T | null>(null)

    useEffect(() => {
        if (!sentinel || !hasNextPage) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage) {
                    void fetchNextPage()
                }
            },
            { rootMargin }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [sentinel, hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin])

    const sentinelRef = useCallback((node: T | null) => setSentinel(node), [])

    return { sentinelRef }
}
