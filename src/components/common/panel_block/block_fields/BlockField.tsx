import { useInfoBlockContext } from '../Block'
import styles from './BlockField.module.css'
import { User } from '@/contracts/data'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import type React from 'react'

export interface BlockFieldProps {
    label: string
    ariaLabel?: string
    showIn?: 'both' | 'view' | 'edit'
    getter: (user: User) => React.ReactNode
    editGetter?: (user: User) => string
    setter?: (user: User, value: string) => User
    inputType?: React.HTMLInputTypeAttribute
}

export function BlockField({
    label,
    ariaLabel,
    showIn = 'both',
    getter,
    editGetter,
    setter,
    inputType,
}: BlockFieldProps) {
    const { user, draft, editing, onDraftChange } = useInfoBlockContext()
    const displayValue = getter(editing ? draft : user)
    if (showIn === 'view' && editing) return null
    if (showIn === 'edit' && !editing) return null

    const isEditable = editing && setter != null
    const isReadonlyInEdit = editing && !isEditable

    return (
        <div className={styles.infoBlockFieldRow}>
            <span className={styles.infoBlockFieldLabel}>{label}</span>
            {isEditable ? (
                <input
                    type={inputType ?? 'text'}
                    className={styles.infoBlockFieldInput}
                    value={editGetter ? editGetter(draft) : ''}
                    placeholder="Empty"
                    onChange={(e) =>
                        onDraftChange((u) => setter(u, e.target.value))
                    }
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
                        {displayValue ?? '-'}
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
