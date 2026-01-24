import { useEffect, useRef } from 'react'

export function useClickAway<T extends Element>(
    callback: (event: Node) => void
) {
    const ref = useRef<T>(null)

    function assertIsNode(event: EventTarget | null): asserts event is Node {
        if (!event || !('nodeType' in event)) {
            throw new Error(`Node expected`)
        }
    }

    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            assertIsNode(event.target)
            if (ref.current && !ref.current.contains(event.target))
                callback(event.target)
        }

        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)
        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, callback])

    return ref
}
