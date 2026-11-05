'use client'

import {
    ControlLayer,
    ControlGroup,
    ControlButton,
} from './controls/ControlLayer'
import EditControls from './controls/EditControls'
import RecenterButton from './controls/RecenterButton'
import ZoomButtons from './controls/ZoomButtons'
import ZoomReadout from './controls/ZoomReadout'
import styles from './controls/zoomReadout.module.css'
import type { ComponentProps } from 'react'
import { FaCopy, FaPaste, FaScissors } from 'react-icons/fa6'

export interface ChartControlsProps {
    editControls?: ComponentProps<typeof EditControls>
}

export function ChartControls({
    editControls,
    clipboard,
}: ChartControlsProps & {
    clipboard?: {
        visible: boolean
        canCopy: boolean
        canEdit: boolean
        canPaste: boolean
        copy: () => void
        cut: () => void
        paste: () => void
    }
}) {
    return (
        <>
            <ControlLayer position="top-left">
                <ZoomButtons />
                <RecenterButton />
                {clipboard && (
                    <div
                        className={styles.wrapper}
                        data-visible={clipboard.visible}
                        aria-hidden={!clipboard.visible}
                        inert={!clipboard.visible}
                    >
                        <ControlGroup>
                            <ControlButton
                                aria-label="Cut selection"
                                title="Cut (Cmd/Ctrl+X)"
                                disabled={
                                    !clipboard.canCopy || !clipboard.canEdit
                                }
                                onClick={clipboard.cut}
                            >
                                <FaScissors size={14} />
                            </ControlButton>
                            <ControlButton
                                aria-label="Copy selection"
                                title="Copy (Cmd/Ctrl+C)"
                                disabled={!clipboard.canCopy}
                                onClick={clipboard.copy}
                            >
                                <FaCopy size={14} />
                            </ControlButton>
                            <ControlButton
                                aria-label="Paste selection"
                                title="Paste (Cmd/Ctrl+V)"
                                disabled={
                                    !clipboard.canPaste || !clipboard.canEdit
                                }
                                onClick={clipboard.paste}
                            >
                                <FaPaste size={14} />
                            </ControlButton>
                        </ControlGroup>
                    </div>
                )}
            </ControlLayer>
            <ControlLayer position="bottom-left">
                <ZoomReadout />
            </ControlLayer>
            {editControls && (
                <ControlLayer position="top-right">
                    <EditControls {...editControls} />
                </ControlLayer>
            )}
        </>
    )
}
