import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { dateService } from '@/services'
import cx from 'classnames'
import { ChangeEvent, useCallback } from 'react'

export interface DateFieldProps<T> extends FormFieldProps<
    T,
    Date | null | undefined
> {
    format?: Intl.DateTimeFormatOptions
}

export function DateField<T>(props: DateFieldProps<T>) {
    const { getter, validator, onChange } = useConfigure(
        props,
        useCallback(
            (field: Date | null | undefined) =>
                (!props.required || field != null) &&
                !isNaN(field?.valueOf() ?? 0),
            [props.required]
        )
    )

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = getter(props.dynamic!.form)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(new Date(event.target.value))
    }

    const handleFocus = () => {
        onChange(value)
    }

    const format = () => {
        if (!dateService.isValid(value)) return undefined
        return Intl.DateTimeFormat(
            'en-US',
            props.format ?? {
                dateStyle: 'long',
                timeStyle: 'medium',
            }
        ).format(value!)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{format()}</div>
            ) : (
                <input
                    type="date"
                    id={props?.id}
                    name={props.label}
                    disabled={disabled}
                    required={props.required}
                    value={
                        dateService.isValid(value)
                            ? value!.toISOString().split('T')[0]
                            : ''
                    }
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={cx(
                        styles.textField,
                        !validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
