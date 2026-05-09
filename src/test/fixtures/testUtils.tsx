import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

/**
 * Shared QueryClient instance for tests.
 * Cleared between tests to ensure isolation.
 */
export const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0, // Disable garbage collection to prevent stale data
        },
        mutations: {
            retry: false,
        },
    },
})

/**
 * Creates a wrapper for renderHook that provides the QueryClient.
 * Reuses a single client instance for performance.
 */
export function createQueryWrapper() {
    const queryClientWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    )

    return queryClientWrapper
}

/**
 * Resets the QueryClient cache between tests.
 * Call this in afterEach.
 */
export function clearQueryClient() {
    testQueryClient.clear()
}
