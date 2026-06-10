import { clearQueryClient } from '@/app/QueryClientWrapper'
import QueryClientWrapper from '@/app/QueryClientWrapper'
import {
    startMirage,
    MIRAGE_API_BASE_URL,
    registerDefaultRoutes,
} from '@/test/mirage'
import { getSuccessfulAuthReturn } from '@/test/useAuthMock'
import * as authModule from '@/util/hooks/useAuth'
import { useFetch } from '@/util/hooks/useFetch'
import { renderHook } from '@testing-library/react'
import { Response } from 'miragejs'
import {
    vi,
    describe,
    beforeAll,
    afterAll,
    afterEach,
    beforeEach,
    it,
    expect,
} from 'vitest'
import z from 'zod'

vi.mock('@/util/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

const useAuthMock = vi.mocked(authModule.useAuth)

let authReturnValue: ReturnType<typeof authModule.useAuth>

let server: ReturnType<typeof startMirage>

beforeAll(() => {
    server = startMirage()
})

afterAll(() => {
    server.shutdown()
})

afterEach(() => {
    registerDefaultRoutes(server)
    clearQueryClient()
    useAuthMock.mockReset()
})

describe('useFetch', () => {
    beforeEach(() => {
        authReturnValue = getSuccessfulAuthReturn()
        useAuthMock.mockReturnValue(authReturnValue)
    })

    it('should perform a GET request with query params', async () => {
        server.get(`${MIRAGE_API_BASE_URL}/items`, () => {
            return { id: 1, name: 'Item 1' }
        })

        const { result } = renderHook(() => useFetch(), {
            wrapper: QueryClientWrapper,
        })

        const data = await result.current.onGet(
            '/items',
            z.object({ id: z.number(), name: z.string() })
        )

        expect(data).toEqual({ id: 1, name: 'Item 1' })
    })

    it('should retry if the first response is 401 and refresh succeeds', async () => {
        let callCount = 0

        server.get(`${MIRAGE_API_BASE_URL}/items`, () => {
            callCount += 1
            if (callCount === 1)
                return new Response(
                    401,
                    {},
                    { message: 'Unauthorized', error: 'AUTH' }
                )
            return { id: 2, name: 'Retry Item' }
        })

        const { result } = renderHook(() => useFetch(), {
            wrapper: QueryClientWrapper,
        })

        const response = await result.current.onGet(
            '/items',
            z.object({ id: z.number(), name: z.string() })
        )

        expect(authReturnValue.onRefresh).toHaveBeenCalled()
        expect(response).toEqual({ id: 2, name: 'Retry Item' })
    })

    it('should throw a FetchError when the response is not ok', async () => {
        server.post(
            `${MIRAGE_API_BASE_URL}/items`,
            () =>
                new Response(
                    400,
                    {},
                    { message: 'Bad request', error: 'INVALID' }
                )
        )

        const { result } = renderHook(() => useFetch(), {
            wrapper: QueryClientWrapper,
        })

        await expect(
            result.current.onPost('/items', { test: true }, null)
        ).rejects.toThrow()
    })
})
