import { FormField, IBaseFormField } from '.'
import classNames from 'classnames'
import { ChangeEvent } from 'react'

export interface SelectFieldOption {
    value: string
    name: string
}

export interface SelectFieldProps extends IBaseFormField {
    options: SelectFieldOption[]
}

export function SelectField({
    name,
    field,
    options,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: SelectFieldProps) {
    const value = (dynamic?.value as string) ?? ''
    const selected = options.find((option) => option.value == value)?.name ?? ''

    const isValid = (value: string) => !required || value.length > 0

    const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value
        dynamic?.onUpdate?.(field, selected, selected, isValid(selected))
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            <div className="col-span-2 flex flex-wrap gap-2">
                {readonly || dynamic?.disabled ? (
                    <div className="col-span-2 w-full">{selected}</div>
                ) : (
                    <select
                        name={name}
                        value={value}
                        onChange={handleSelect}
                        disabled={dynamic?.loading}
                        className={classNames(
                            'col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5',
                            !isValid(value) && 'border-red-300'
                        )}
                    >
                        {options.map(({ value, name }) => (
                            <option key={value} value={value}>
                                {name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </FormField>
    )
}
