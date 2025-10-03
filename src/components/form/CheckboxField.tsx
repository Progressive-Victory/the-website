import { IFormField } from '.'

export interface IFormFieldCheckbox extends IFormField {
    type: 'checkbox'
}

export function MakeCheckboxField(
    name: string,
    key: string,
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldCheckbox {
    return {
        type: 'checkbox',
        name,
        key,
        ...(flags ?? {}),
    }
}

export interface CheckboxFieldProps {
    field: IFormFieldCheckbox
    value?: boolean
    isDisabled: boolean
    isLoading: boolean
    onUpdate: (value: boolean) => void
}

export function CheckboxField({
    field,
    value,
    isDisabled,
    isLoading,
    onUpdate,
}: CheckboxFieldProps) {
    if (field.readonly || isDisabled)
        return <div className="col-span-2 w-full">{`${value ?? false}`}</div>

    return (
        <div className="col-span-2 flex items-center">
            <input
                type="checkbox"
                name={field.key}
                id={field.key}
                disabled={isLoading}
                required={field.required}
                checked={value}
                onChange={(e) => onUpdate(e.target.checked)}
            />
        </div>
    )
}
