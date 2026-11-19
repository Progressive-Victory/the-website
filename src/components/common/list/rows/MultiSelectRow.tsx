'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './MultiSelectRow.module.css'
import { cn } from '@/util'
import { useState, type KeyboardEvent } from 'react'
import { FiX } from 'react-icons/fi'

export interface MultiSelectRowProps
    extends ListRowBaseProps, ListRowFieldProps<string[]> {
    placeholder?: string
    maxLength?: number
}

export function MultiSelectRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    placeholder = 'Press Enter To Add',
    maxLength = 100,
    labelAlign = 'top',
    ...rowProps
}: MultiSelectRowProps) {
    const [input, setInput] = useState('')
    const { value, onValueChange, invalid } = useListField<string[]>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (items) => !items?.length,
            editing: rowProps.editing,
        }
    )
    const items = value ?? []
    const addItem = () => {
        const item = input.trim()
        if (
            !item ||
            items.some(
                (current) => current.toLowerCase() === item.toLowerCase()
            )
        )
            return setInput('')
        onValueChange([...items, item])
        setInput('')
    }
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            addItem()
        }
        if (event.key === 'Backspace' && !input && items.length)
            onValueChange(items.slice(0, -1))
    }
    const display = items.length ? (
        <span className={styles.values}>
            {items.map((item, index) => (
                <span key={`${item}-${index}`} className={styles.tagDisplay}>
                    {item}
                </span>
            ))}
        </span>
    ) : undefined

    return (
        <ListRow
            {...rowProps}
            className={cn(styles.row, rowProps.className)}
            labelAlign={labelAlign}
            invalid={invalid}
            value={display}
            editor={(labelId) => (
                <div
                    role="group"
                    aria-labelledby={labelId}
                    className={cn(styles.editor, invalid && styles.invalid)}
                >
                    {items.map((item, index) => (
                        <button
                            key={`${item}-${index}`}
                            type="button"
                            aria-label={`Remove ${item}`}
                            className={styles.tag}
                            onClick={() =>
                                onValueChange(
                                    items.filter(
                                        (_, itemIndex) => itemIndex !== index
                                    )
                                )
                            }
                        >
                            <span className={styles.tagLabel}>{item}</span>
                            <span className={styles.remove}>
                                <FiX aria-hidden="true" />
                            </span>
                        </button>
                    ))}
                    <input
                        type="text"
                        aria-label="Press Enter To Add"
                        value={input}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        className={styles.input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            )}
        />
    )
}
