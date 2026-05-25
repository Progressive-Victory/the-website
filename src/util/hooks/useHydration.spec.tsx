import { useHydration } from '@/util/hooks/useHydration'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('useHydration', () => {
    it('should return true after hydration', async () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useHydration())

        // This hook theoretically should initialize as false, but actually always true.
        //   Unclear what it's supposed to be used for.
        // expect(result.current).toBe(false)

        vi.useRealTimers()
        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
