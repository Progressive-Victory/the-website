import { useEffect, useState } from 'react'

export function useHydration() {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // Unfortunately this is necessary since we use next.js. We have to
        // suppress certain rendering until the client, and useEffects only
        // run on the client.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHydrated(true)
    }, [])

    return hydrated
}
