'use client'

import { ControlGroup, ControlButton } from './ControlLayer'
import { useReactFlow, useStore } from '@xyflow/react'
import { FaMinus, FaPlus } from 'react-icons/fa6'

export default function ZoomButtons() {
    const { zoomIn, zoomOut } = useReactFlow()
    const zoom = useStore((state) => state.transform[2])
    const minZoom = useStore((state) => state.minZoom)
    const maxZoom = useStore((state) => state.maxZoom)

    return (
        <ControlGroup>
            <ControlButton
                aria-label="Zoom in"
                title="Zoom in"
                onClick={() => void zoomIn()}
                disabled={zoom >= maxZoom}
            >
                <FaPlus size={14} />
            </ControlButton>
            <ControlButton
                aria-label="Zoom out"
                title="Zoom out"
                onClick={() => void zoomOut()}
                disabled={zoom <= minZoom}
            >
                <FaMinus size={14} />
            </ControlButton>
        </ControlGroup>
    )
}
