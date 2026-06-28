import { useEffect, useRef } from 'react'

export function useClickAway<T extends Element>(
    callback: (event: Node) => void
) {
    const ref = useRef<T>(null)

    console.log('ClickAway rerender!')

    function assertIsNode(event: EventTarget | null): asserts event is Node {
        if (!event || !('nodeType' in event)) {
            throw new Error(`Node expected`)
        }
    }

    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            assertIsNode(event.target)
            const contains = ref.current && !ref.current.contains(event.target)
            console.log('Event hit!', contains, event.target)
            if (contains) callback(event.target)
        }

        document.addEventListener('mouseup', listener)
        document.addEventListener('touchend', listener)
        return () => {
            console.log('ClickAway cleanup!')
            document.removeEventListener('mouseup', listener)
            document.removeEventListener('touchend', listener)
        }
    }, [ref, callback])

    return ref
}
