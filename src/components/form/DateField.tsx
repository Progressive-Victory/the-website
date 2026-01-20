import { FormField, FormFieldProps, getGetter, getSetter } from './FormField'
import styles from './FormField.module.css'
import { dateService } from '@/services'
import cx from 'classnames'
import { ChangeEvent } from 'react'

export interface DateFieldProps<T>
    extends FormFieldProps<T, Date | null | undefined> {
    format?: Intl.DateTimeFormatOptions
}

export function DateField<T>(props: DateFieldProps<T>) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)
    props.validator ??= (field: Date | null | undefined) =>
        (!props.required || field != null) && !isNaN(field?.valueOf() ?? 0)

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props?.getter?.(props.dynamic!.form)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        props.dynamic?.onChange?.(props, new Date(newValue))
    }

    const handleFocus = () => {
        props.dynamic?.onChange?.(props, value)
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
                        !props.validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
