import {
    IFormFieldText,
    TextField,
    CheckboxField,
    IFormFieldSelectMany,
    SelectManyField,
    IFormFieldCheckbox,
} from '@/components/form'

export interface IFormField {
    type: string
    name: string
    key: string
    required?: boolean
    readonly?: boolean
    deprecated?: boolean
}

export interface FormFieldProps {
    field: IFormField
    value?: unknown
    isDisabled: boolean
    isLoading: boolean
    activeFieldMenu: string | null
    setActiveFieldMenu: (value: string | null) => void
    onUpdate: (value: unknown) => void
}

export function FormField({
    field,
    value,
    isDisabled,
    isLoading,
    activeFieldMenu,
    setActiveFieldMenu,
    onUpdate,
}: FormFieldProps) {
    return (
        <div className="contents">
            <div className="pl-6">
                <label
                    key={field.key}
                    htmlFor={field.key}
                    className="font-medium"
                >
                    {field.name}
                    {field.required && (
                        <span
                            className="ml-1 text-red-500"
                            title="Required Field"
                        >
                            *
                        </span>
                    )}
                    {field.deprecated && (
                        <span
                            className="ml-1 text-yellow-500"
                            title="Deprecated Field"
                        >
                            **
                        </span>
                    )}
                </label>
            </div>
            {field.type === 'text' && (
                <TextField
                    field={field as IFormFieldText}
                    value={value as string}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    onUpdate={onUpdate}
                />
            )}
            {field.type === 'checkbox' && (
                <CheckboxField
                    field={field as IFormFieldCheckbox}
                    value={value as boolean}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    onUpdate={onUpdate}
                />
            )}
            {field.type === 'select_many' && (
                <SelectManyField
                    field={field as IFormFieldSelectMany}
                    value={value as Record<string, string>[]}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    activeFieldMenu={activeFieldMenu}
                    setActiveFieldMenu={setActiveFieldMenu}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    )
}
