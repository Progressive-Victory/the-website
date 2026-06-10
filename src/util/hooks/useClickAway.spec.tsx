import { useClickAway } from '@/util/hooks/useClickAway'
import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('useClickAway', () => {
    it('should call callback when clicking outside the referenced element', () => {
        const callback = vi.fn()
        const { result } = renderHook(() =>
            useClickAway<HTMLDivElement>(callback)
        )

        const div = document.createElement('div')
        document.body.appendChild(div)
        result.current.current = div

        act(() => {
            const event = new MouseEvent('mousedown', { bubbles: true })
            document.body.dispatchEvent(event)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should not call callback when clicking inside the referenced element', () => {
        const callback = vi.fn()
        const { result } = renderHook(() =>
            useClickAway<HTMLDivElement>(callback)
        )

        const div = document.createElement('div')
        document.body.appendChild(div)
        result.current.current = div

        act(() => {
            const event = new MouseEvent('mousedown', { bubbles: true })
            div.dispatchEvent(event)
        })

        expect(callback).not.toHaveBeenCalled()
    })
})
