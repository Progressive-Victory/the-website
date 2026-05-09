import { useHydration } from '@/util/hooks/useHydration'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('useHydration', () => {
    it('should return true after hydration', async () => {
        const { result } = renderHook(() => useHydration())

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
