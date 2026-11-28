import { useSyncExternalStore } from 'react'

/**
 * A helper function that returns a value (true/false)
 * that indicates if its parent component has been
 * mounted on screen.
 * */
export function useHydration() {
    return useSyncExternalStore(
        () => () => null,
        () => true,
        () => false
    )
}
