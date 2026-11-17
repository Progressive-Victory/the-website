import { useEffect, useState } from 'react'

export function useHydration() {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHydrated(true)
    }, [])

    return hydrated
}
