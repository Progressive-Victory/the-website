import { useCallback, useEffect, useState } from 'react'

export function useHydration() {
    const [hydrated, setHydrated] = useState(false)

    const hydrate = useCallback(() => {
        setHydrated(true)
    }, [setHydrated])

    useEffect(() => {
        return hydrate
    }, [hydrate])

    return hydrated
}
