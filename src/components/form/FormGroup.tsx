import { DynamicFormFieldProps, FormFieldProps } from './FormField'
import styles from './FormGroup.module.css'
import { CollapsibleSection } from '@/components/common'
import { ReactElement } from 'react'

export interface FormGroupProps<T> {
    id?: string
    title: string
    defaultCollapsed?: boolean

    dynamic?: DynamicFormFieldProps<T>

    children?:
        | ReactElement<FormFieldProps<T>>
        | ReactElement<FormFieldProps<T>>[]
}

export function FormGroup<T>({
    id,
    title,
    defaultCollapsed,
    dynamic,
    children = [],
}: FormGroupProps<T>) {
    const fields = Array.isArray(children) ? children : [children]

    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.group}>
                {fields?.map((field, i) => ({
                    ...field,
                    props: {
                        ...field.props,
                        id: field.props.id ?? `${id}-${i}`,
                        dynamic,
                    },
                }))}
            </div>
        </CollapsibleSection>
    )
}
