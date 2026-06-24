'use client'

import styles from './SidebarList.module.css'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import React from 'react'
import type { ReactNode } from 'react'

export interface SidebarBodyItemConfig {
    key: string | number
    label: string
    subtitle?: string
    tagLabel?: string
    iconNode?: ReactNode
    href: string
    onClick: (event: React.MouseEvent) => void
}

export interface SidebarBodyProps<T> {
    items: T[]
    isLoading?: boolean
    error?: unknown
    selectedKey?: string | number | null
    renderItem: (item: T) => SidebarBodyItemConfig
}

export function SidebarBody<T>({
    items,
    isLoading = false,
    error = null,
    selectedKey = null,
    renderItem,
}: SidebarBodyProps<T>) {
    if (isLoading) {
        return <div className={styles.sidebarState}>Loading...</div>
    }

    if (error) {
        const message =
            error instanceof Error
                ? error.message
                : typeof error === 'object' &&
                    error !== null &&
                    'message' in error &&
                    typeof (error as { message?: unknown }).message === 'string'
                  ? (error as { message: string }).message
                  : 'Unknown error'

        return (
            <div className={styles.sidebarState} style={{ color: '#ef4444' }}>
                Error: {message}
            </div>
        )
    }

    if (items.length === 0) {
        return <div className={styles.sidebarState}>No items found</div>
    }

    return (
        <>
            {items.map((item) => {
                const config = renderItem(item)
                return (
                    <NavigationButton
                        key={config.key}
                        active={selectedKey === config.key}
                        href={config.href}
                        label={config.label}
                        subtitle={config.subtitle}
                        tagLabel={config.tagLabel}
                        iconNode={config.iconNode}
                        onClick={config.onClick}
                        showIndicator={false}
                        className={styles.sidebarNavigationButton}
                    />
                )
            })}
        </>
    )
}
