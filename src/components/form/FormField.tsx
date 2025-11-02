import { ReactNode } from 'react'

export interface IBaseFormField {
    name: string
    field: string
    required?: boolean
    readonly?: boolean
    deprecated?: boolean
    dynamic?: {
        value?: unknown
        disabled?: boolean
        loading?: boolean
        onUpdate?: (fieldKey: string, value: unknown, patchValue: unknown, valid: boolean) => void
    }
}

export interface FormFieldProps {
    name: string
    field: string
    required?: boolean
    deprecated?: boolean
    children?: ReactNode
}

export function FormField({
    name,
    field,
    required = false,
    deprecated = false,
    children,
}: FormFieldProps) {
    return (
        <div className="contents">
            <div className="pl-6">
                <label key={field} htmlFor={field} className="font-medium">
                    {name}
                    {required && (
                        <span
                            className="ml-1 text-red-500"
                            title="Required Field"
                        >
                            *
                        </span>
                    )}
                    {deprecated && (
                        <span
                            className="ml-1 text-yellow-500"
                            title="Deprecated Field"
                        >
                            **
                        </span>
                    )}
                </label>
            </div>
            {children}
        </div>
    )
}
