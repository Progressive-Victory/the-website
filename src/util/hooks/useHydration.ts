import { useSyncExternalStore } from 'react'

export function useHydration() {
    return useSyncExternalStore(
        () => () => null,
        () => true,
        () => false
    )
}
