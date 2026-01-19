import { FormField, IBaseFormField } from '.'
import classNames from 'classnames'
import { FormEvent } from 'react'

export function TextField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    prefix,
    dynamic,
}: IBaseFormField) {
    const value = (dynamic?.value as string) ?? ''

    const isValid = (text: string) => !required || text.trim().length > 0

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        const newValue = (event.target as HTMLTextAreaElement).value
        dynamic?.onUpdate?.(field, newValue, newValue.trim(), isValid(newValue))
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">{prefix}{value}</div>
            ) : (
                <input
                    type="text"
                    name={name}
                    id={field}
                    disabled={dynamic?.loading}
                    required={required}
                    value={value}
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
