import { FormField, IBaseFormField } from '.'
import MultiSelect from '../admin/MultiSelect'
import { useState } from 'react'

export interface SelectManyFieldProps extends IBaseFormField {
    nameKey: string
    valueKey: string
    options: unknown[]
}

export function SelectManyField({
    name,
    field,
    nameKey,
    valueKey,
    options,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: SelectManyFieldProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    const values = (dynamic?.value as Record<string, string>[]) ?? []
    const active = values.map((value) => value[valueKey])
    const recordOptions = options as Record<string, string>[]

    const isValid = (values: unknown[]) => !required || values.length > 0

    const handleUpdate = (values: string[]) => {
        const selected = recordOptions.filter((option) =>
            values.some((value) => option[valueKey] == value)
        )
        dynamic?.onUpdate?.(field, selected, values, isValid(selected))
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            <div className="col-span-2 flex flex-wrap gap-2">
                <MultiSelect
                    name={name}
                    readonly={readonly || dynamic?.disabled}
                    options={recordOptions}
                    displayKey={nameKey}
                    valueKey={valueKey}
                    active={active}
                    addActive={(value) => handleUpdate([...active, value])}
                    removeActive={(value) =>
                        handleUpdate(
                            active.filter((active) => active !== value)
                        )
                    }
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    disabled={dynamic?.loading}
                />
            </div>
        </FormField>
    )
}
