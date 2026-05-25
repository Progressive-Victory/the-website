import { useAuth } from './useAuth'
import { clearQueryClient } from '@/app/QueryClientWrapper'
import QueryClientWrapper from '@/app/QueryClientWrapper'
import { startMirage, MIRAGE_API_BASE_URL } from '@/test/mirage'
import { mockDataService } from '@/test/mockDataService'
import { renderHook } from '@testing-library/react'
import 'miragejs'
import { Response } from 'miragejs'
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'

let server: ReturnType<typeof startMirage>

beforeEach(() => {
    server = startMirage()
    vi.useFakeTimers()
})

afterEach(() => {
    server.shutdown()
    vi.useRealTimers()
    clearQueryClient()
})

describe('useAuth', () => {
    describe('Settings Query', () => {
        it('should fetch apiBaseUrl from settings', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)

            expect(result.current.apiBaseUrl).toBe(MIRAGE_API_BASE_URL)
        })
    })

    describe('Session Query', () => {
        it('should fetch the current session when apiBaseUrl is available', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })

            await vi.advanceTimersByTimeAsync(100)

            expect(result.current.session).not.toBeNull()

            expect(result.current.session).toEqual(
                mockDataService.getTokenClaimsForUser()
            )
        })

        it('should set isSessionLoading to true while loading', async () => {
            server.timing = 50
            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            expect(result.current.isSessionLoading).toBe(true)

            await vi.advanceTimersByTimeAsync(200)

            expect(result.current.session).not.toBeNull()
        })

        it('should set session to null when user is not authenticated (404)', async () => {
            server.get(`${MIRAGE_API_BASE_URL}/auth`, () => new Response(404))

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })

            await vi.advanceTimersByTimeAsync(100)
            expect(result.current.isSessionLoading).toBe(false)

            expect(result.current.session).toBeNull()
        })

        it('should trigger logout on non-404 auth errors', async () => {
            server.get(`${MIRAGE_API_BASE_URL}/auth`, () => new Response(500))

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })

            await vi.advanceTimersByTimeAsync(100)

            // After error, session should be null due to logout
            expect(result.current.session).toBeNull()
        })
    })

    describe('Login Function', () => {
        let mockAssign = vi.fn()
        beforeEach(() => {
            // Create a mock with the method you want to track
            mockAssign = vi.fn()

            // Use stubGlobal to replace the read-only window.location
            vi.stubGlobal('location', {
                ...window.location,
                assign: mockAssign,
            })
        })
        afterEach(() => {
            mockAssign.mockRestore()
            vi.unstubAllGlobals()
        })
        it('should throw error when login fetch fails', async () => {
            // Mock a failed login endpoint
            server.get(`${MIRAGE_API_BASE_URL}/auth/discord/login`, () => {
                return new Response(500, {
                    errors: 'Internal Server Error',
                })
            })

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)

            const loginPromise = expect(
                result.current.onLogin('redirect-url')
            ).rejects.toThrow('Failed to get login url from the API')
            await vi.advanceTimersByTimeAsync(100)
            await loginPromise

            expect(mockAssign).not.toHaveBeenCalled()
        })

        it('should handle login with custom redirect', async () => {
            // Mock the login endpoint to return a redirect URL
            server.get(`${MIRAGE_API_BASE_URL}/auth/discord/login`, () => ({
                redirectUri: 'login-redirect-url',
            }))

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)

            const loginPromise = result.current.onLogin('login-redirect-url')
            await vi.advanceTimersByTimeAsync(1000)
            await loginPromise

            expect(mockAssign).toHaveBeenCalledWith('login-redirect-url')
        })
    })

    describe('Logout Function', () => {
        let mockAssign = vi.fn()
        beforeEach(() => {
            // Create a mock with the method you want to track
            mockAssign = vi.fn()

            // Use stubGlobal to replace the read-only window.location
            vi.stubGlobal('location', {
                ...window.location,
                assign: mockAssign,
            })
        })
        afterEach(() => {
            mockAssign.mockRestore()
            vi.unstubAllGlobals()
        })
        it('should make POST request to logout endpoint', async () => {
            let logoutCalled = false
            server.post(`${MIRAGE_API_BASE_URL}/auth/logout`, () => {
                logoutCalled = true
                return {}
            })

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)

            // Actually invoke the mutation
            const logoutPromise = result.current.onLogout()
            await vi.advanceTimersByTimeAsync(100)
            await logoutPromise

            // Verify the POST was made
            expect(logoutCalled).toBe(true)
        })
    })

    describe('Refresh Function', () => {
        it('should call refresh endpoint with credentials', async () => {
            let requestMade = false
            server.post(`${MIRAGE_API_BASE_URL}/auth/refresh`, () => {
                requestMade = true
                return true
            })

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)
            expect(result.current.session).not.toBeNull()

            // Invoke refresh and verify the endpoint was called
            const refreshPromise = result.current.onRefresh()
            await vi.advanceTimersByTimeAsync(100)
            const refreshResult = await refreshPromise

            expect(requestMade).toBe(true)
            expect(refreshResult.data).toBe(true)
        })

        it('should trigger logout when refresh fails', async () => {
            server.post(
                `${MIRAGE_API_BASE_URL}/auth/refresh`,
                () => new Response(401)
            )

            // Spy on the logout endpoint to verify it's called
            const logoutSpy = vi.fn(() => ({}))
            server.post(`${MIRAGE_API_BASE_URL}/auth/logout`, logoutSpy)

            const { result } = renderHook(() => useAuth(), {
                wrapper: QueryClientWrapper,
            })
            await vi.advanceTimersByTimeAsync(100)
            expect(result.current.session).not.toBeNull()

            const refreshPromise = result.current.onRefresh()
            await vi.advanceTimersByTimeAsync(100)
            const refreshResult = await refreshPromise
            // Query succeeds but returns false data
            expect(refreshResult.data).toBe(false)
            // Verify logout endpoint was called
            expect(logoutSpy).toHaveBeenCalled()
        })
    })
})
