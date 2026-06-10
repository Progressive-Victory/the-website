import useInView from '@/util/hooks/useInView'
import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'

describe('useInView', () => {
    const observeMock = vi.fn()
    let intersectionCallback: IntersectionObserverCallback | undefined

    beforeAll(() => {
        class IntersectionObserverMock {
            constructor(cb: IntersectionObserverCallback) {
                intersectionCallback = cb
            }
            observe = observeMock
            unobserve = vi.fn()
            disconnect = vi.fn()
        }
        vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
    })

    afterEach(() => {
        observeMock.mockClear()
    })

    it('should update inView when the observer reports intersection', () => {
        const { result } = renderHook(() => useInView())

        expect(result.current.inView).toBe(false)

        act(() => {
            intersectionCallback?.(
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
