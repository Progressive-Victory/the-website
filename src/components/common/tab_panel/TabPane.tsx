'use client'

import { ReactElement, ComponentProps } from 'react'

export interface TabPaneProps {
    label: string
    children?: React.ReactNode
}

export function TabPane({ children }: TabPaneProps) {
    return children
}

export type ITabPane = ReactElement<ComponentProps<typeof TabPane>>
