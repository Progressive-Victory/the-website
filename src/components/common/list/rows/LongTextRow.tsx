'use client'

import { useListEditing } from '../ListContext'
import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './LongTextRow.module.css'
import fields from './fields.module.css'
import { cn } from '@/util'
import { useLayoutEffect, useRef } from 'react'

export interface LongTextRowProps
    extends ListRowBaseProps, ListRowFieldProps<string> {
    placeholder?: string
    maxLength?: number
}

export function LongTextRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    placeholder = 'Placeholder',
    maxLength,
    labelAlign = 'top',
    ...rowProps
}: LongTextRowProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const editing = useListEditing(rowProps.editing)
    const { value, onValueChange, invalid } = useListField<string>(
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
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )
    useLayoutEffect(() => {
        const textarea = textareaRef.current
        if (!textarea || !editing) return

        textarea.style.height = 'auto'
        const computedStyle = window.getComputedStyle(textarea)
        const borderHeight =
            Number.parseFloat(computedStyle.borderTopWidth) +
            Number.parseFloat(computedStyle.borderBottomWidth)
        textarea.style.height = `${textarea.scrollHeight + borderHeight}px`
    }, [editing, value])

    return (
        <ListRow
            {...rowProps}
            className={cn(styles.row, rowProps.className)}
            labelAlign={labelAlign}
            invalid={invalid}
            value={value}
            editor={(labelId) => (
                <div className={styles.editor}>
                    <textarea
                        ref={textareaRef}
                        aria-labelledby={labelId}
                        value={value ?? ''}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        rows={3}
                        onChange={(event) =>
                            onValueChange?.(event.target.value)
                        }
                        className={cn(fields.textField, styles.textarea)}
                    />
                </div>
            )}
        />
    )
}
