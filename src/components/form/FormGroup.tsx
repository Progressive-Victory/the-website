import { IBaseFormField } from '.'
import { CollapsableSection } from '@/components/common'
import React from 'react'

export interface FormGroupProps {
    title: string
    defaultCollapsed?: boolean
    children?:
        | React.ReactElement<IBaseFormField>
        | React.ReactElement<IBaseFormField>[]
    dynamic?: {
        value?: unknown
        disabled?: boolean
        loading?: boolean
        onUpdate?: (
            field: string,
            value: unknown,
            patchValue: unknown,
            valid: boolean
        ) => void
    }
}

export function FormGroup({
    title,
    defaultCollapsed = false,
    children = [],
    dynamic,
}: FormGroupProps) {
    const fields = Array.isArray(children) ? children : [children]

    // This populates each field with parent form information such as edit mode, values,
    // and update handling, which would otherwise be identical across fields.
    const hydratedFields = fields.map((field) => {
        return {
            ...field,
            props: {
                ...field.props,
                dynamic: {
                    ...field.props.dynamic,
                    value:
                        field.props.dynamic?.value ??
                        (dynamic?.value as Record<string, unknown>)?.[
                            field.props.field
                        ],
                    disabled:
                        field.props.dynamic?.disabled ?? dynamic?.disabled,
                    loading: field.props.dynamic?.loading ?? dynamic?.loading,
                    onUpdate:
                        field.props.dynamic?.onUpdate ?? dynamic?.onUpdate,
                },
            },
        }
    })

    return (
        <CollapsableSection title={title} initialOpenState={!defaultCollapsed}>
            <div className="grid grid-cols-3 gap-2 gap-x-4">
                {hydratedFields}
            </div>
        </CollapsableSection>
    )
}
