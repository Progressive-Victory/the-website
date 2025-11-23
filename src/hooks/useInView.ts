import { useEffect, useRef, useState } from "react"

export default function useInView() {
    const [inView, setInView] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        observerRef.current = new IntersectionObserver(([entry]) => {
            setInView(entry.isIntersecting)
        })

        return () => observerRef.current?.disconnect()
    }, [])

    const observe = (element: HTMLElement | null) => {
        if (element) observerRef.current?.observe(element)
    }

    return { inView, observe }
}

