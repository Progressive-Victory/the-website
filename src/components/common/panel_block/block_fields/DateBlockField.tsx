'use client'

import { useInfoBlockContext } from '../Block'
import { FieldInfoPanel } from './BlockField'
import styles from './BlockField.module.css'
import { DropdownMenu } from '@/components/common/dropdown_menu/DropdownMenu'
import { User } from '@/contracts/data'
import { dateService } from '@/services'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'

export type DateDisplayFormat =
    | 'date'
    | 'date-long'
    | 'date-short'
    | 'datetime'
    | 'datetime-long'
    | 'time'

const FORMAT_PRESETS: Record<DateDisplayFormat, Intl.DateTimeFormatOptions> = {
    date: { timeZone: 'UTC', dateStyle: 'medium' },
    'date-long': { timeZone: 'UTC', dateStyle: 'long' },
    'date-short': { timeZone: 'UTC', dateStyle: 'short' },
    datetime: { dateStyle: 'medium', timeStyle: 'short' },
    'datetime-long': { dateStyle: 'long', timeStyle: 'medium' },
    time: { timeStyle: 'short' },
}

export interface DateBlockFieldProps {
    label: string
    ariaLabel?: string
    showIn?: 'both' | 'view' | 'edit'
    description?: string
    getter: (user: User) => Date | string | null | undefined
    setter?: (user: User, date: Date | null) => User
    displayFormat?: DateDisplayFormat
    formatOptions?: Intl.DateTimeFormatOptions
}

function formatDate(
    value: Date | string | null | undefined,
    options: Intl.DateTimeFormatOptions
): string {
    if (!dateService.isValid(value)) return '-'
    return new Intl.DateTimeFormat('en-US', options).format(new Date(value!))
}

export function DateBlockField({
    label,
    ariaLabel,
    showIn = 'both',
    description,
    getter,
    setter,
    displayFormat = 'date',
    formatOptions,
}: DateBlockFieldProps) {
    const resolvedFormat = formatOptions ?? FORMAT_PRESETS[displayFormat]
    const { user, draft, editing, onDraftChange, setFieldMenuOpen } =
        useInfoBlockContext()
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    if (showIn === 'view' && editing) return null
    if (showIn === 'edit' && !editing) return null

    const isEditable = editing && setter != null
    const isReadonlyInEdit = editing && !isEditable
    const value = getter(editing ? draft : user)
    const displayValue = formatDate(value, resolvedFormat)

    return (
        <div className={styles.infoBlockFieldRow}>
            <span className={styles.infoBlockFieldLabel}>{label}</span>
            {isEditable ? (
                <input
                    type="date"
                    className={styles.infoBlockFieldInput}
                    value={
                        dateService.isValid(value)
                            ? new Date(value!).toISOString().split('T')[0]
                            : ''
                    }
                    onChange={(e) => {
                        const date = e.target.value
                            ? new Date(e.target.value)
                            : null
                        onDraftChange((u) => setter(u, date))
                    }}
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
                        <span
                            className={`${styles.infoBlockFieldValue} ${styles.infoBlockFieldValueWrap}`}
                        >
                            {displayValue}
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
                            <FieldInfoPanel description={description} />
                        </DropdownMenu>
                    )}
                </div>
            )}
        </div>
    )
}
