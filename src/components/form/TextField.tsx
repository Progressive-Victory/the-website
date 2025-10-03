import { IFormField } from '.'

export interface IFormFieldText extends IFormField {
    type: 'text'
}

export function MakeTextField(
    name: string,
    key: string,
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldText {
    return {
        type: 'text',
        name,
        key,
        ...(flags ?? {}),
    }
}

export interface TextFieldProps {
    field: IFormFieldText
    value?: string
    isDisabled: boolean
    isLoading: boolean
    onUpdate: (value: string) => void
}

export function TextField({
    field,
    value,
    isDisabled,
    isLoading,
    onUpdate,
}: TextFieldProps) {
    if (field.readonly || isDisabled)
        return <div className="col-span-2 w-full">{value ?? ''}</div>

    return (
        <input
            type="text"
            name={field.key}
            id={field.key}
            disabled={isLoading}
            required={field.required}
            value={value ?? ''}
            onInput={(e) => onUpdate((e.target as HTMLTextAreaElement).value)}
            className="col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5"
        />
    )
}
