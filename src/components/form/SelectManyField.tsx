import { IFormField } from '.'
import MultiSelect from '../admin/MultiSelect'

export interface IFormFieldSelectMany extends IFormField {
    type: 'select_many'
    display_key: string
    value_key: string
    options: Record<string, string>[]
}

export function MakeSelectManyField(
    name: string,
    key: string,
    displayKey: string,
    valueKey: string,
    options: unknown[],
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldSelectMany {
    return {
        type: 'select_many',
        name,
        key,
        display_key: displayKey,
        value_key: valueKey,
        options: options as Record<string, string>[],
        ...(flags ?? {}),
    }
}

export interface SelectManyFieldProps {
    field: IFormFieldSelectMany
    value?: Record<string, string>[]
    isDisabled: boolean
    isLoading: boolean
    activeFieldMenu: string | null
    setActiveFieldMenu: (value: string | null) => void
    onUpdate: (value: Record<string, string>[]) => void
}

export function SelectManyField({
    field,
    value,
    isDisabled,
    isLoading,
    activeFieldMenu,
    setActiveFieldMenu,
    onUpdate,
}: SelectManyFieldProps) {
    const handleAddActive = (added: string) =>
        onUpdate([
            ...(value ?? []),
            field.options.find((o) => o[field.value_key] === added) ?? {},
        ])

    const handleRemoveActive = (removed: string) =>
        onUpdate((value ?? []).filter((v) => v[field.value_key] !== removed))

    return (
        <div className="col-span-2 flex flex-wrap gap-2">
            <MultiSelect
                disabled={isLoading}
                readonly={(field.readonly ?? false) || isDisabled}
                name={field.name}
                options={value ?? []}
                query_key={field.key}
                display_key={field.display_key}
                value_key={field.value_key}
                active={(value ?? []).map((v) => v[field.value_key])}
                addActive={handleAddActive}
                removeActive={handleRemoveActive}
                menuOpen={activeFieldMenu == field.key}
                setMenuOpen={(open) =>
                    setActiveFieldMenu(open ? field.key : null)
                }
            />
        </div>
    )
}
