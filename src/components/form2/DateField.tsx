import { FormField, FormFieldProps, getGetter, getSetter } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import { ChangeEvent, useEffect, useState } from 'react'

export function DateField<T>(
    props: FormFieldProps<T, Date | null | undefined>
) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)
    props.validator ??= (field: Date | null | undefined) =>
        (!props.required || field != null) && !isNaN(field?.valueOf() ?? 0)

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props?.getter?.(props.dynamic!.form)

    const [dateText, setDateText] = useState('')

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        setDateText(newValue)
        props.dynamic?.onChange?.(props, new Date(newValue))
    }

    useEffect(() => {
        if (!readonly) setDateText(value?.toISOString() ?? '')
    }, [readonly, value])

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{value?.toDateString()}</div>
            ) : (
                <input
                    type="date"
                    id={props?.id}
                    name={props.label}
                    disabled={disabled}
                    required={props.required}
                    value={dateText}
                    onInput={handleInput}
                    className={cx(
                        styles.textField,
                        !props.validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
