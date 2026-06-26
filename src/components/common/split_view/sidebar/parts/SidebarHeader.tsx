'use client'

/* Sidebar.Header — SKELETON. Presence => header region renders. */
import styles from '../Sidebar.module.css'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarHeaderProps {
    children?: ReactNode
}

export function SidebarHeader({ children }: SidebarHeaderProps): ReactElement {
    return (
        <div className={styles.header} data-part="header">
            {children}
        </div>
    )
}
