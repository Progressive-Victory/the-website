import { FormField, IBaseFormField } from '.'
import { dateService } from '@/services'
import classNames from 'classnames'
import { FormEvent, useState } from 'react'

export function DateField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: IBaseFormField) {
    const initialValue = dynamic?.value as Date | undefined

    const [value, setValue] = useState(initialValue?.toISOString() ?? '')

    const format = (date: string) => {
        if (date) {
            const [year, month, day] = date.split('-')
            return `${month}/${day}/${year}`
        }
        return date
    }

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        const formatted = (event.target as HTMLTextAreaElement).value
        setValue(formatted)

        const isValid = dateService.isValid(formatted)
        const date = isValid ? new Date(formatted) : null
        dynamic?.onUpdate?.(field, date, date, isValid)
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">{format(value)}</div>
            ) : (
                <input
                    type="date"
                    name={name}
                    id={field}
                    disabled={dynamic?.loading}
                    required={required}
                    value={value}
                    onInput={handleInput}
                    className={classNames(
                        'col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5',
                        value && 'border-red-300'
                    )}
                />
            )}
        </FormField>
    )
}
