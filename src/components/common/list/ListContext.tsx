'use client'

import { createContext, useContext } from 'react'

export type ListRowValueAlign = 'left' | 'center' | 'right'

export interface ListFieldConfiguration {
    getter: (form: unknown) => unknown
    setter: (form: unknown, value: unknown) => unknown
    validator: (value: unknown) => boolean
}

export interface ListFormState {
    form?: unknown
    editing?: boolean
    saving?: boolean
    onChange?: (id: string, value: unknown) => void
    onConfigure?: (id: string, configuration: ListFieldConfiguration) => void
}

export interface ListContextValue {
    editing: boolean
    valueAlign?: ListRowValueAlign
    formState?: ListFormState
}

export const ListContext = createContext<ListContextValue>({ editing: false })

export function useListEditing(override?: boolean) {
    const { editing } = useContext(ListContext)
    return override ?? editing
}

export function useListValueAlign(override?: ListRowValueAlign) {
    const { valueAlign } = useContext(ListContext)
    return override ?? valueAlign ?? 'right'
}
