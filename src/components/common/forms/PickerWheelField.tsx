'use client'

import { FormField, FormFieldProps, useConfigure } from './FormField'
import formFieldStyles from './FormField.module.css'
import styles from './PickerWheelField.module.css'
import { DropdownButton, DropdownOverlay } from '@/components/common/dropdown'
import {
    PickerWheel,
    type PickerWheelProps,
} from '@/components/common/picker_wheel/PickerWheel'
import { useCallback, useState } from 'react'

type PickerWheelValue = string | number

export interface PickerWheelFieldProps<T>
    extends
        FormFieldProps<T, PickerWheelValue | null | undefined>,
        Pick<
            PickerWheelProps<PickerWheelValue>,
            'options' | 'visibleCount' | 'itemHeight'
        > {}

export function PickerWheelField<T>(props: PickerWheelFieldProps<T>) {
    const { getter, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: PickerWheelValue | null | undefined) =>
                !props.required || !!field,
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form)
    const [draft, setDraft] = useState(value)
    const selectedLabel = props.options.find(
        (option) => option.value === value
    )?.label
    const placeholder = `Select ${props.label.toLowerCase()}`

    if (readonly)
        return (
            <FormField {...props}>
                <div className={formFieldStyles.readonly}>{selectedLabel}</div>
            </FormField>
        )

    return (
        <FormField {...props}>
            <DropdownButton
                label={selectedLabel ?? placeholder}
                disabled={disabled}
                className={styles.trigger}
                onClick={() => setDraft(value ?? props.options[0]?.value)}
                menu={({ closeDropdown }) => (
                    <DropdownOverlay
                        label={placeholder}
                        onClose={closeDropdown}
                        onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                        narrowLayoutMode="trigger"
                        className={styles.overlay}
                        footerButtonLabel="Confirm"
                        footerButtonClassName={styles.confirmButton}
                        footerButtonDisabled={draft == null || draft === value}
                        footerButtonOnClick={() => {
                            onChange(draft)
                            closeDropdown()
                        }}
                        body={
                            <PickerWheel
                                id={props.id}
                                aria-label={props.label}
                                options={props.options}
                                value={draft}
                                onChange={setDraft}
                                onPick={(picked) => {
                                    if (picked !== value) onChange(picked)
                                    closeDropdown()
                                }}
                                visibleCount={props.visibleCount}
                                itemHeight={props.itemHeight}
                                className={styles.wheel}
                            />
                        }
                    />
                )}
            />
        </FormField>
    )
}
