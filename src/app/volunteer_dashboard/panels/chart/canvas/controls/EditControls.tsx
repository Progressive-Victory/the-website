'use client'

import { ControlGroup, ControlButton } from './ControlLayer'
import styles from './editControls.module.css'
import { cn } from '@/util'
import { FaSave, FaTrashAlt } from 'react-icons/fa'
import { FaPencil } from 'react-icons/fa6'

interface EditControlsProps {
    isEditing: boolean
    isDirty: boolean
    disabled?: boolean
    saveLabel?: string
    onEdit: () => void
    onSave: () => void
    onDiscard: () => void
}

export default function EditControls({
    isEditing,
    isDirty,
    disabled = false,
    saveLabel = 'Save',
    onEdit,
    onSave,
    onDiscard,
}: EditControlsProps) {
    return (
        <div className={styles.row}>
            {isEditing ? (
                <>
                    <ControlGroup key="save">
                        <ControlButton
                            className={cn(styles.button, styles.save)}
                            onClick={onSave}
                            disabled={!isDirty || disabled}
                        >
                            <FaSave size={14} /> {saveLabel}
                        </ControlButton>
                    </ControlGroup>
                    <ControlGroup key="discard">
                        <ControlButton
                            className={cn(styles.button, styles.discard)}
                            onClick={onDiscard}
                            disabled={disabled}
                        >
                            <FaTrashAlt size={14} /> Discard
                        </ControlButton>
                    </ControlGroup>
                </>
            ) : (
                <ControlGroup key="edit">
                    <ControlButton
                        className={cn(styles.button, styles.edit)}
                        onClick={onEdit}
                    >
                        <FaPencil size={14} /> Edit
                    </ControlButton>
                </ControlGroup>
            )}
        </div>
    )
}
