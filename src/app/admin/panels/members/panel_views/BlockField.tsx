import styles from './MemberView.module.css'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import type React from 'react'

export interface BlockFieldEditConfig {
    inputType?: React.HTMLInputTypeAttribute
    value: string
    placeholder?: string
    onFocus?: () => void
    onBlur?: () => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface BlockFieldProps {
    label: string
    ariaLabel?: string
    /** Whether the parent block is currently in edit mode. */
    editing?: boolean
    /**
     * Controls visibility per mode.
     * - 'both'  (default): visible in both view and edit mode
     * - 'view':  only visible when not editing
     * - 'edit':  only visible when editing
     */
    showIn?: 'both' | 'view' | 'edit'
    /** Value shown in view mode, or as a readonly display when editing without an edit config. */
    value?: React.ReactNode
    /** When provided and editing=true, renders an editable input. Omit to make the field readonly in edit mode. */
    edit?: BlockFieldEditConfig
}

export function BlockField({
    label,
    ariaLabel,
    editing = false,
    showIn = 'both',
    value,
    edit,
}: BlockFieldProps) {
    if (showIn === 'view' && editing) return null
    if (showIn === 'edit' && !editing) return null

    const isReadonlyInEdit = editing && edit == null

    return (
        <div className={styles.infoBlockFieldRow}>
            <span className={styles.infoBlockFieldLabel}>{label}</span>
            {editing && edit != null ? (
                <input
                    type={edit.inputType ?? 'text'}
                    className={styles.infoBlockFieldInput}
                    value={edit.value}
                    placeholder={edit.placeholder}
                    onFocus={edit.onFocus}
                    onBlur={edit.onBlur}
                    onChange={edit.onChange}
                    aria-label={ariaLabel}
                />
            ) : (
                <button
                    type="button"
                    className={styles.infoBlockInfoButton}
                    aria-label={ariaLabel}
                    disabled={isReadonlyInEdit}
                >
                    <span className={styles.infoBlockFieldValue}>
                        {value ?? '-'}
                    </span>
                    {!isReadonlyInEdit && (
                        <InformationCircleIcon
                            className={styles.infoBlockInfoIcon}
                        />
                    )}
                </button>
            )}
        </div>
    )
}
