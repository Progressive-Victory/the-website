'use client'

/*
 * Sidebar.Featured — SKELETON.
 *
 * Pinned region directly below the header that does NOT scroll with the list
 * (e.g. an account card / primary call-to-action). Presence is what makes the
 * featured region appear.
 */
import styles from '../Sidebar.module.css'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarFeaturedProps {
    children?: ReactNode
}

export function SidebarFeatured({
    children,
}: SidebarFeaturedProps): ReactElement {
    return (
        <div className={styles.featured} data-part="featured">
            {children}
        </div>
    )
}
