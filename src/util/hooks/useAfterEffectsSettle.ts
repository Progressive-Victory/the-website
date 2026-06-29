import { useEffect, useRef } from 'react'

/**
 * Waits for all useEffect loops to end before executing the callback,
 * thereby debouncing the callback.
 * @param callback Function to run when the useEffect loops end.
 *
 * @param deps Dependencies triggering a re-run of the callback
 */
export function useAfterEffectsSettle(
    callback: () => void,
    deps: React.DependencyList
) {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined)
    const cbRef = useRef(callback)

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => cbRef.current(), 0)

        return () => clearTimeout(timeoutRef.current)
    }, deps) // linter does not like deps since it is not a static array
}
