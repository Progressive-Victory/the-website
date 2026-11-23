'use client'

import styles from './JurisdictionField.module.css'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import { useListEditing } from '@/components/common/list/ListContext'
import type { ListRowIndicator } from '@/components/common/list/ListRow'
import { DropdownRow } from '@/components/common/list/rows/DropdownRow'
import {
    useListField,
    type ListRowFieldProps,
} from '@/components/common/list/useListField'
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'

const officeOptions = [
    'President',
    'U.S. Senate',
    'U.S. House',
    'Governor',
    'Lieutenant Governor',
    'Attorney General',
    'Secretary of State',
    'State Senate',
    'State House',
    'Mayor',
    'City Council',
    'County Commission',
    'School Board',
]

const isCustomOffice = (office: string) =>
    !!office && !officeOptions.includes(office)

export interface OfficeFieldProps extends ListRowFieldProps<string | null> {
    label: string
    editing?: boolean
    readOnly?: boolean
    indicator?: ListRowIndicator
}

export function OfficeField({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    editing: editingOverride,
    ...rowProps
}: OfficeFieldProps) {
    const { value, onValueChange } = useListField<string | null>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator: validator ?? (() => true),
        },
        {
            required: false,
            isEmpty: (value) => !value?.trim(),
            editing: editingOverride,
        }
    )
    const office = value ?? ''
    const editing = useListEditing(editingOverride)
    const [otherSelected, setOtherSelected] = useState(isCustomOffice(office))
    const [otherValue, setOtherValue] = useState(
        isCustomOffice(office) ? office : ''
    )
    const otherInputRef = useRef<HTMLInputElement>(null)
    const previousEditing = useRef(editing)

    const draftOffice = otherValue.trim()
    const hasChange = otherSelected && !!draftOffice && draftOffice !== office

    const syncToOffice = useCallback(() => {
        setOtherSelected(isCustomOffice(office))
        setOtherValue(isCustomOffice(office) ? office : '')
    }, [office])

    useEffect(syncToOffice, [syncToOffice])
    useEffect(() => {
        if (previousEditing.current === editing) return
        previousEditing.current = editing
        syncToOffice()
    }, [editing, syncToOffice])

    const confirm = (closeDropdown: () => void) => {
        if (!hasChange) return

        onValueChange(draftOffice)
        closeDropdown()
    }

    const selectOther = () => {
        setOtherSelected(true)
        setOtherValue(isCustomOffice(office) ? office : '')
        requestAnimationFrame(() => otherInputRef.current?.focus())
    }

    return (
        <DropdownRow
            {...rowProps}
            editing={editingOverride}
            readOnly={rowProps.readOnly}
            value={office}
            onValueChange={(next) => onValueChange(String(next))}
            placeholder="Select"
            triggerLabel={office || 'Select'}
            onTriggerClick={syncToOffice}
            validator={(next) =>
                validator ? validator(String(next ?? '')) : true
            }
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    label="Select Office"
                    onClose={closeDropdown}
                    onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                    narrowLayoutMode="trigger"
                    className={styles.overlay}
                    footerButtonLabel="Confirm"
                    footerButtonClassName={styles.confirmButton}
                    footerButtonDisabled={!hasChange}
                    footerButtonOnClick={() => confirm(closeDropdown)}
                    body={
                        <div className={styles.options}>
                            {officeOptions.map((option) => (
                                <DropdownOverlayButton
                                    key={option}
                                    selected={
                                        !otherSelected && office === option
                                    }
                                    onClick={() => {
                                        setOtherSelected(false)
                                        onValueChange(option)
                                        closeDropdown()
                                    }}
                                >
                                    {option}
                                </DropdownOverlayButton>
                            ))}
                            {otherSelected ? (
                                <input
                                    ref={otherInputRef}
                                    type="text"
                                    aria-label="Other office"
                                    placeholder="Custom Office"
                                    value={otherValue}
                                    onChange={(event) =>
                                        setOtherValue(
                                            event.target.value.slice(0, 100)
                                        )
                                    }
                                    onKeyDown={(
                                        event: KeyboardEvent<HTMLInputElement>
                                    ) => {
                                        if (event.key !== 'Enter') return
                                        event.preventDefault()
                                        confirm(closeDropdown)
                                    }}
                                    className={styles.otherInput}
                                />
                            ) : (
                                <DropdownOverlayButton onClick={selectOther}>
                                    Other
                                </DropdownOverlayButton>
                            )}
                        </div>
                    }
                />
            )}
        />
    )
}
