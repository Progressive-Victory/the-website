import { FormField, IBaseFormField } from '.'
import classNames from 'classnames'
import { FormEvent } from 'react'

export function parseTimezonelessDate(date: string) {
    return new Date(date + ' GMT')
}

export function DateField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: IBaseFormField) {
    const value = (dynamic?.value as string) ?? ''
    const dateValue = parseTimezonelessDate(value) // Makes sure the date uses UTC

    const isValid = (text: string) => {
        const textInvalid = isNaN(new Date(text).valueOf())
        if (textInvalid) {
            console.error(`Invalid date string parsed: ${text}`)
        }
        return !required || !textInvalid
    }

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        const newValue = (event.target as HTMLTextAreaElement).value
        const newDate = parseTimezonelessDate(newValue)
        const formattedDate = `${(newDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${newDate.getUTCDate().toString().padStart(2, '0')}/${newDate.getFullYear()}`
        dynamic?.onUpdate?.(
            field,
            formattedDate,
            formattedDate.trim(),
            isValid(formattedDate)
        )
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">{value}</div>
            ) : (
                <input
                    type="date"
                    name={name}
                    id={field}
                    disabled={dynamic?.loading}
                    required={required}
                    value={dateValue.toISOString().split('T')[0]}
                    onInput={handleInput}
                    className={classNames(
                        'col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5',
                        !isValid(value) && 'border-red-300'
                    )}
                />
            )}
        </FormField>
    )
}
