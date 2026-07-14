import { DynamicFormFieldProps } from './FormField'
import styles from './FormGroup.module.css'
import { CollapsibleSection } from '@/components/common'
import React from 'react'

/** Properties for the FormGroup component. */
export interface FormGroupProps<T> {
    /**
     * This group's id. Unless you really need it, you should leave this
     * undefined. This is used to tell React which group this is, as well as to
     * identify child fields. Defaults to this component's index in the parent
     * Form's children.
     */
    id?: string

    /** The group's title, displayed as a heading above the fields. */
    title: string

    /** An optional subtitle displayed below the heading. */
    subtitle?: string

    /** Whether the group is displayed as collapsed by default. */
    defaultCollapsed?: boolean

    /**Whether the group is meant to wrap other form groups or not */
    wrapper?: boolean

    /**Wheter the group is a sub group of a bigger */
    subGroup?: boolean

    /**
     * Internal form state, populated automatically by the parent Form
     * component. Do not put any value here!
     */
    dynamic?: DynamicFormFieldProps<T>

    /**
     * Form group children. For form features, use a list of form fields,
     * though all children will be displayed.
     */
    children?: React.ReactNode
}

/**
 * Component for displaying a collapsible list of form fields under a group
 * header. Should be used as a child to a Form component.
 *
 * To display form fields, add them as children to this component.
 *
 * See `Form` and `FormField` for details.
 *
 * IMPORTANT: This component will prefill `id` and override `dynamic`
 * properties of all direct children. If you're passing any component which
 * depends on `id` being undefined or `dynamic` having a custom value, this
 * break it. If that is an issue, wrap your component in a div.
 */
export function FormGroup<T>({
    id,
    title,
    subtitle,
    defaultCollapsed,
    wrapper,
    subGroup,
    dynamic,
    children = [],
}: FormGroupProps<T>) {
    // Populate default id and dynamic data into the children. Only user-
    // defined components will be hydrated, but note that this includes
    // non-form-specific components.
    const hydratedChildren = React.Children.map(children, (child, i) => {
        // If the node is a non-element or a builtin, change nothing.
        if (!React.isValidElement(child) || typeof child.type == 'string')
            return child

        // Otherwise, default `id` if it's undefined, and override `dynamic`.
        return {
            ...child,
            props: {
                id: `${id}-${i}`,
                ...(child.props as object),
                dynamic,
            },
        }
    })

    return (
        <CollapsibleSection
            title={title}
            subtitle={subtitle}
            initialOpenState={!defaultCollapsed}
            subGroup={subGroup}
        >
            {wrapper ? (
                <div>{hydratedChildren}</div>
            ) : (
                <div className={styles.group}>{hydratedChildren}</div>
            )}
        </CollapsibleSection>
    )
}
