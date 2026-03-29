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
    description?: string
    sourceLabel?: string
    sourceValue?: React.ReactNode
    lastUpdatedLabel?: string
    lastUpdatedValue?: React.ReactNode
    getter: (user: User) => React.ReactNode
    editGetter?: (user: User) => string
    setter?: (user: User, value: string) => User
    inputType?: React.HTMLInputTypeAttribute
    children?: React.ReactNode
}

const HISTORY_SKEL_WIDTHS = ['62%', '51%', '70%', '57%', '65%'] as const

export function FieldInfoPanel({
    description,
    sourceLabel,
    sourceValue,
    lastUpdatedLabel,
    lastUpdatedValue,
}: {
    description?: string
    sourceLabel?: string
    sourceValue?: React.ReactNode
    lastUpdatedLabel?: string
    lastUpdatedValue?: React.ReactNode
}) {
    return (
        <>
            {description && <p className={styles.fieldDesc}>{description}</p>}
            <div className={styles.fieldMeta}>
                <div className={styles.fieldMetaItem}>
                    <span className={styles.fieldMetaLabel}>{sourceLabel ?? 'Source'}</span>
                    {sourceValue != null
                        ? <span className={styles.fieldMetaValue}>{sourceValue}</span>
                        : <span className={styles.fieldMetaSkel} />}
                </div>
                <div className={styles.fieldMetaItem}>
                    <span className={styles.fieldMetaLabel}>{lastUpdatedLabel ?? 'Last updated'}</span>
                    {lastUpdatedValue != null
                        ? <span className={styles.fieldMetaValue}>{lastUpdatedValue}</span>
                        : <span className={styles.fieldMetaSkel} />}
                </div>
            </div>
            <div className={styles.fieldHistorySection}>
                <span className={styles.fieldHistoryLabel}>Recent changes</span>
                <div className={styles.fieldHistoryList}>
                    {HISTORY_SKEL_WIDTHS.map((w, i) => (
                        <div key={i} className={styles.fieldHistoryRow}>
                            <span
                                className={styles.fieldHistorySkel}
                                style={{ maxWidth: w }}
                            />
                            <span className={styles.fieldHistorySkelDate} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export function BlockField({
    label,
    ariaLabel,
    showIn = 'both',
    description,
    sourceLabel,
    sourceValue,
    lastUpdatedLabel,
    lastUpdatedValue,
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
                            label={`${label} Information`}
                        >
                            <FieldInfoPanel
                                description={description}
                                sourceLabel={sourceLabel}
                                sourceValue={sourceValue}
                                lastUpdatedLabel={lastUpdatedLabel}
                                lastUpdatedValue={lastUpdatedValue}
                            />
                            {children && (
                                <>
                                    <DropdownMenu.Divider />
                                    {children}
                                </>
                            )}
                        </DropdownMenu>
                    )}
                </div>
            )}
        </div>
    )
}
