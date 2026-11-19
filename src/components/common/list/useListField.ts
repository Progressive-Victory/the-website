'use client'

import { ListContext } from './ListContext'
import { useContext, useEffect, useId, useRef } from 'react'

export interface ListRowFieldProps<T> {
    value?: T | null
    onValueChange?: (value: T) => void
    field?: string
    getter?: (form: never) => T | null | undefined
    setter?: (form: never, value: T) => unknown
    validator?: (value: T | null | undefined) => boolean
}

export function useListField<T>(
    props: ListRowFieldProps<T>,
    {
        required,
        isEmpty,
        editing: editingOverride,
    }: {
        required: boolean
        isEmpty: (value: T | null | undefined) => boolean
        editing?: boolean
    }
) {
    const { editing, formState } = useContext(ListContext)
    const id = useId()
    const bound =
        formState?.onChange != null &&
        (props.field != null || props.getter != null)

    const latest = useRef({ props, required, isEmpty })
    useEffect(() => {
        latest.current = { props, required, isEmpty }
    })

    const onConfigure = formState?.onConfigure
    useEffect(() => {
        if (!bound) return
        onConfigure?.(id, {
            getter: (form) => {
                const { getter, field } = latest.current.props
                if (getter) return getter(form as never)
                return (form as Record<string, unknown>)[field!]
            },
            setter: (form, value) => {
                const { setter, field } = latest.current.props
                if (setter) return setter(form as never, value as T)
                return { ...(form as object), [field!]: value }
            },
            validator: (value) => {
                const { props, required, isEmpty } = latest.current
                if (props.validator)
                    return props.validator(value as T | null | undefined)
                return !required || !isEmpty(value as T | null | undefined)
            },
        })
    }, [bound, id, onConfigure])

    const value = bound
        ? props.getter
            ? props.getter(formState.form as never)
            : (formState.form as Record<string, T | null | undefined>)[
                  props.field!
              ]
        : props.value

    const onValueChange = (next: T) => {
        if (bound) formState.onChange!(id, next)
        props.onValueChange?.(next)
    }

    const valid = props.validator
        ? props.validator(value)
        : !required || !isEmpty(value)

    return {
        value,
        onValueChange,
        invalid: (editingOverride ?? editing) && !valid,
    }
}
