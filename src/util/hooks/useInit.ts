import { useState } from 'react'

export default function useInit(callback: () => void) {
    const [initialized, setInitialized] = useState(false)

    if (!initialized) {
        callback()
        setInitialized(true)
    }
}
