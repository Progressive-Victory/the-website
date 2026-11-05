'use client'

import { ControlGroup } from './ControlLayer'
import styles from './zoomReadout.module.css'
import { useStore } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'

const READOUT_LINGER = 1200

export default function ZoomReadout() {
    const zoom = useStore((state) => state.transform[2])
    const percent = useStore(
        (state) =>
            ((state.maxZoom - state.transform[2]) /
                (state.maxZoom - state.minZoom)) *
            100
    )
    const [isZooming, setIsZooming] = useState(false)
    const lastZoom = useRef(zoom)

    useEffect(() => {
        if (lastZoom.current === zoom) return
        lastZoom.current = zoom
        setIsZooming(true)
        const timer = setTimeout(() => setIsZooming(false), READOUT_LINGER)

        return () => clearTimeout(timer)
    }, [zoom])

    return (
        <div className={styles.wrapper} data-visible={isZooming}>
            <ControlGroup>
                <output className={styles.readout}>
                    {Math.round(percent)}%
                </output>
            </ControlGroup>
        </div>
    )
}
