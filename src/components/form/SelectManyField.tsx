import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { MultiSelect, MultiSelectOption } from '@/components/common'
import { useCallback } from 'react'

export interface SelectManyFieldProps<T> extends FormFieldProps<
    T,
    (string | number)[] | null | undefined
> {
    options: MultiSelectOption[]
}

export function SelectManyField<T>(props: SelectManyFieldProps<T>) {
    const { getter, onChange } = useConfigure(
        props,
        useCallback(
            (field: (string | number)[] | null | undefined) =>
                !props.required || !!field?.length,
            [props.required]
        )
    )

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = getter(props.dynamic!.form) ?? []

    const handleUpdate = (selected: (string | number)[]) => {
        onChange(selected)
    }

    return (
        <FormField {...props}>
            <div className={styles.selectManyField}>
                <MultiSelect
                    name={props.label}
                    options={props.options}
                    selected={value}
                    readonly={readonly}
                    disabled={disabled}
                    onUpdate={handleUpdate}
                />
            </div>
        </FormField>
    )
}
