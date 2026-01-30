import { useState } from 'react'

export function useInit(callback: () => void) {
    const [initialized, setInitialized] = useState(false)

    if (!initialized) {
        callback()
        setInitialized(true)
    }
}
