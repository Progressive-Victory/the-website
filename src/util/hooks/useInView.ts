import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInViewReturn {
    inView: boolean
    observe: (element: HTMLElement | null) => void
}

export function useInView(): UseInViewReturn {
    const [inView, setInView] = useState<boolean>(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            observerRef.current = new IntersectionObserver(([entry]) => {
                setInView(!!entry?.isIntersecting)
            })
        }

        return () => observerRef.current?.disconnect()
    }, [])

    const observe = useCallback((element: HTMLElement | null) => {
        if (element && observerRef.current) {
            observerRef.current.observe(element)
        }
    }, [])

    return { inView, observe }
}
