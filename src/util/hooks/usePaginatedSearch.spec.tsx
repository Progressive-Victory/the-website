import { clearQueryClient } from '@/app/QueryClientWrapper'
import QueryClientWrapper from '@/app/QueryClientWrapper'
import { OnGetMock, getFetchMocks } from '@/test/useFetchMock'
import type { ZodSchema } from '@/util/hooks/useFetch'
import * as fetchModule from '@/util/hooks/useFetch'
import { usePaginatedSearch } from '@/util/hooks/usePaginatedSearch'
import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, afterEach, Mock } from 'vitest'
import z from 'zod'

vi.mock('@/util/hooks/useFetch', () => ({
    useFetch: vi.fn(),
}))
const useFetchMock = vi.mocked(fetchModule.useFetch)

const ORIGINAL_LIMIT = 2
const SEARCH_ITEMS = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' },
]

const createPageResponse = (page: number, limit: number) => {
    const offset = page * ORIGINAL_LIMIT
    const pageData = SEARCH_ITEMS.slice(offset, offset + limit)

    return {
        page,
        limit,
        count: SEARCH_ITEMS.length,
        data: pageData,
    }
}
const onGetMock = vi.fn(function <R>(
    url: string,
    schema: ZodSchema,
    options?: { query?: Record<string, unknown> }
): Promise<R> {
    const page = Number(options?.query?.page ?? 0)
    const limit = Number(options?.query?.limit ?? ORIGINAL_LIMIT)
    return Promise.resolve(createPageResponse(page, limit)) as Promise<R>
}) as OnGetMock
useFetchMock.mockReturnValue({
    ...getFetchMocks(),
    onGet: onGetMock,
})

afterEach(() => {
    clearQueryClient()
    ;(onGetMock as Mock).mockClear()
})

describe('usePaginatedSearch', () => {
    it('should fetch the first page of results', async () => {
        const { result } = renderHook(
            () =>
                usePaginatedSearch(
                    '/users/search',
                    z.object({ id: z.number(), name: z.string() }),
                    { search: { limit: 2, page: 0 } }
                ),
            {
                wrapper: QueryClientWrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.query.data).toBeDefined()
        })

        expect(result.current.query.data?.data).toHaveLength(2)
        expect(result.current.search.limit).toBe(2)
        expect(onGetMock).toHaveBeenCalledWith(
            '/users/search',
            expect.anything(),
            expect.objectContaining({ query: { limit: 2, page: 0 } })
        )
    })

    it('should fetch all pages when all option is enabled', async () => {
        const { result } = renderHook(
            () =>
                usePaginatedSearch(
                    '/users/search',
                    z.object({ id: z.number(), name: z.string() }),
                    { search: { limit: 2, page: 0 }, all: true }
                ),
            {
                wrapper: QueryClientWrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.query.data).toBeDefined()
        })

        expect(result.current.query.data?.count).toBe(SEARCH_ITEMS.length)
        expect(onGetMock).toHaveBeenCalledTimes(3)
        expect(onGetMock).toHaveBeenCalledWith(
            '/users/search',
            expect.anything(),
            expect.objectContaining({ query: { limit: 2, page: 0 } })
        )
        expect(onGetMock).toHaveBeenCalledWith(
            '/users/search',
            expect.anything(),
            expect.objectContaining({ query: { limit: 2, page: 1 } })
        )
        expect(onGetMock).toHaveBeenCalledWith(
            '/users/search',
            expect.anything(),
            expect.objectContaining({ query: { limit: 1, page: 2 } })
        )
    })

    it('should update the search object when onSearch is called', async () => {
        const { result } = renderHook(
            () =>
                usePaginatedSearch(
                    '/users/search',
                    z.object({ id: z.number(), name: z.string() }),
                    { search: { limit: 2, page: 0 } }
                ),
            {
                wrapper: QueryClientWrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.query.data).toBeDefined()
        })

        act(() => {
            result.current.onSearch({ limit: 1, page: 0 })
        })

        await waitFor(() => {
            expect(result.current.search.limit).toBe(1)
        })
    })
})
