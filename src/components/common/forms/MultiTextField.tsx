import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { cn } from '@/util'
import { ChangeEvent, KeyboardEventHandler, useCallback, useState } from 'react'
import { FaXmark } from 'react-icons/fa6'

export interface MultiTextProps<T> extends FormFieldProps<
    T,
    Set<string> | null | undefined
> {
    readonlyClassName?: string
}

export function MultiTextField<T>(props: MultiTextProps<T>) {
    const [inputValue, setInputValue] = useState('')
    const { getter, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: Set<string> | null | undefined) =>
                !props.required || !!field?.size,
            [props.required]
        )
    )

    const value = new Set(getter(props.dynamic!.form) ?? [])

    const handleKeyDown: KeyboardEventHandler = (event) => {
        if (!inputValue) return

        switch (event.key) {
            case 'Enter':
            case 'Tab':
                onChange(value.add(inputValue))
                setInputValue('')
                event.preventDefault()
        }
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const handleRemoveValue = (val: string) => {
        value.delete(val)
        onChange(value)
    }

    const renderValue = (val: string, idx: number, readonly: boolean) => {
        return (
            <span key={`${val}-${idx}`} className={styles.valueTag}>
                {val}
                {!readonly && (
                    <FaXmark
                        onClick={() => handleRemoveValue(val)}
                        className={styles.remove}
                    />
                )}
            </span>
        )
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div
                    className={cn(
                        styles.valueTagContainer,
                        styles.readonly,
                        props.readonlyClassName
                    )}
                >
                    {[...value].map((v, i) => renderValue(v, i, readonly))}
                </div>
            ) : (
                <div className={styles.multiTextRoot}>
                    <div className={styles.valueTagContainer}>
                        {[...value].map((v, i) => renderValue(v, i, readonly))}
                    </div>
                    <input
                        type="text"
                        id={props?.id}
                        name={props.label}
                        disabled={disabled}
                        required={props.required}
                        value={inputValue}
                        onKeyDown={handleKeyDown}
                        onChange={handleInputChange}
                        className={cn(styles.textField)}
                    />
                </div>
            )}
        </FormField>
    )
}
