import { useSyncExternalStore } from 'react'

function doNothing() {
    // For the linter
}

const subscribe = () => doNothing

export function useHydration() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}
