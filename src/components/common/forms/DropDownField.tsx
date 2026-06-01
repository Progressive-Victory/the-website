import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { ChangeEvent, useCallback, useMemo } from 'react'

export interface DropDownProps<T, F> extends FormFieldProps<T, F> {
    options: { value: string | number | null; label: string }[]
}

export function DropDownField<T>(
    props: DropDownProps<T, string | number | null | undefined>
) {
    const { getter, onChange, readonly } = useConfigure(
        props,
        useCallback(
            (field: string | number | null | undefined) =>
                !props.required || !!field,
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form) ?? ''

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value)
    }

    const selectedLabel = useMemo(
        () => props.options.find((x) => x.value === value)?.label,
        [value, props.options]
    )

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{selectedLabel}</div>
            ) : (
                <select
                    id={props?.id}
                    name={props.label}
                    value={value}
                    onChange={handleChange}
                    disabled={props.dynamic?.saving == true}
                    className={formFieldStyles.textField}
                >
                    {props.options.map((option) => (
                        <option key={option.value} value={option.value ?? undefined}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </FormField>
    )
}
