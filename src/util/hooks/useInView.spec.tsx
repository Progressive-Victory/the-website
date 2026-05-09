import useInView from '@/util/hooks/useInView'
import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'

describe('useInView', () => {
    const observeMock = vi.fn()
    const disconnectMock = vi.fn()
    let callback: IntersectionObserverCallback | undefined

    beforeAll(() => {
        window.IntersectionObserver = vi.fn(function (
            cb: IntersectionObserverCallback
        ) {
            callback = cb
            return {
                observe: observeMock,
                disconnect: disconnectMock,
            }
        }) as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
        observeMock.mockClear()
        disconnectMock.mockClear()
        callback = undefined
    })

    it('should update inView when the observer reports intersection', () => {
        const { result } = renderHook(() => useInView())

        act(() => {
            callback?.(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(result.current.inView).toBe(true)
    })

    it('should call observe on the provided element', () => {
        const { result } = renderHook(() => useInView())
        const element = document.createElement('div')

        act(() => {
            result.current.observe(element)
        })

        expect(observeMock).toHaveBeenCalledWith(element)
    })
})
