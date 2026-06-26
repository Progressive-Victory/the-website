'use client'

/*
 * Sidebar.Footer — SKELETON.
 *
 * Presence => pinned footer renders. When omitted, the shell auto-fills the
 * footer slot with the collapse <Sidebar.Toggle> (composition-driven default).
 */
import styles from '../Sidebar.module.css'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarFooterProps {
    children?: ReactNode
}

export function SidebarFooter({ children }: SidebarFooterProps): ReactElement {
    return (
        <div className={styles.footer} data-part="footer">
            {children}
        </div>
    )
}
