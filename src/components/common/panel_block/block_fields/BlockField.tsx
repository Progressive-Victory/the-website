'use client'

import { useInfoBlockContext } from '../Block'
import styles from './BlockField.module.css'
import { DropdownMenu } from '@/components/common/dropdown_menu/DropdownMenu'
import { User } from '@/contracts/data'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import type React from 'react'
import { useRef, useState } from 'react'

export interface BlockFieldProps {
    label: string
    ariaLabel?: string
    showIn?: 'both' | 'view' | 'edit'
    getter: (user: User) => React.ReactNode
    editGetter?: (user: User) => string
    setter?: (user: User, value: string) => User
    inputType?: React.HTMLInputTypeAttribute
    children?: React.ReactNode
}

export function BlockField({
    label,
    ariaLabel,
    showIn = 'both',
    getter,
    editGetter,
    setter,
    inputType,
    children,
}: BlockFieldProps) {
    const { user, draft, editing, onDraftChange, setFieldMenuOpen } =
        useInfoBlockContext()
    const displayValue = getter(editing ? draft : user)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

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
                <div className={styles.infoBlockButtonWrapper}>
                    <button
                        ref={triggerRef}
                        type="button"
                        className={styles.infoBlockInfoButton}
                        aria-label={ariaLabel}
                        aria-expanded={menuOpen}
                        disabled={isReadonlyInEdit}
                        onClick={() => {
                            const next = !menuOpen
                            setMenuOpen(next)
                            setFieldMenuOpen(next)
                        }}
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
                    {menuOpen && (
                        <DropdownMenu
                            triggerRef={triggerRef}
                            onClose={() => {
                                setMenuOpen(false)
                                setFieldMenuOpen(false)
                            }}
                            label={`${label} options`}
                        >
                            {children}
                        </DropdownMenu>
                    )}
                </div>
            )}
        </div>
    )
}
