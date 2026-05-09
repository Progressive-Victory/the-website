import { useInit } from '@/util/hooks/useInit'
import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { describe, it, expect } from 'vitest'

describe('useInit', () => {
    it('should call the callback once when initialized', () => {
        const callback = vi.fn()

        renderHook(() => useInit(callback))

        expect(callback).toHaveBeenCalledTimes(1)
    })
})
