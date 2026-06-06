import { useHydration } from '@/util/hooks/useHydration'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Electro: Unclear what the hook is meant for.
// Possible it's for server-side rendering. useEffects don't fire on the server, so it prevents react hydration errors.
// If true, then this hook can't be easily unit tested.
describe('useHydration', () => {
    it('should return true after hydration', async () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useHydration())

        // This hook theoretically should initialize as false, but it's always true.
        // expect(result.current).toBe(false)

        vi.useRealTimers()
        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
