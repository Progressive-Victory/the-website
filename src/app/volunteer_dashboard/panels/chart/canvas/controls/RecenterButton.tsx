'use client'

import { ControlGroup, ControlButton } from './ControlLayer'
import { useReactFlow } from '@xyflow/react'
import { FaExpand } from 'react-icons/fa6'

export default function RecenterButton() {
    const { fitView, getNodes } = useReactFlow()

    const handleClick = () => {
        const selected = getNodes().filter((node) => node.selected)
        if (selected.length === 0) {
            void fitView({ duration: 400 })
            return
        }
        void fitView({ nodes: selected, maxZoom: 1.5, duration: 400 })
    }

    return (
        <ControlGroup>
            <ControlButton
                aria-label="Fit view"
                title="Fit view"
                onClick={handleClick}
            >
                <FaExpand size={14} />
            </ControlButton>
        </ControlGroup>
    )
}
