'use client'

import { ReactElement, ComponentProps } from 'react'

export interface TabProps {
    label: string
    children?: React.ReactNode
}

export function Tab({ children }: TabProps) {
    return children
}

export type ITab = ReactElement<ComponentProps<typeof Tab>>
