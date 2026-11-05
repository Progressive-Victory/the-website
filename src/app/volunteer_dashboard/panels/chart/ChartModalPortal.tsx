'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const ChartModalHostContext = createContext<HTMLDivElement | null>(null)

export function ChartModalPortal({ children }: { children: ReactNode }) {
    const host = useContext(ChartModalHostContext)
    return host ? createPortal(children, host) : null
}
