'use client'

import styles from './SidebarList.module.css'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import type {
    NavigationButtonType,
    SubTagProps,
} from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { cn, parseErrorMessage } from '@/util'
import React from 'react'
import type { ReactNode } from 'react'

export interface SidebarBodyItemConfig<T> {
    key: string | number
    label: string
    subtitle?: string
    tagLabel?: string
    tagCount?: number
    tagClassName?: string
    subTags?: SubTagProps[]
    icon?: ReactNode
    href: string
    buttonType?: NavigationButtonType
    children?: T[]
    onClick: (event: React.MouseEvent) => void
}

export interface SidebarBodyProps<T> {
    items: T[]
    pinnedItems?: T[]
    isLoading?: boolean
    error?: unknown
    selectedKey?: string | number | null
    renderItem: (item: T) => SidebarBodyItemConfig<T>
}

export function SidebarBody<T>({
    items,
    pinnedItems,
    isLoading = false,
    error = null,
    selectedKey = null,
    renderItem,
}: SidebarBodyProps<T>) {
    if (isLoading) return <div className={styles.sidebarState}>Loading...</div>

    if (error) {
        const message = parseErrorMessage(error)

        return (
            <div className={styles.sidebarState} style={{ color: '#ef4444' }}>
                Error: {message}
            </div>
        )
    }

    if (items.length === 0 && !pinnedItems?.length) {
        return <div className={styles.sidebarState}>No items found</div>
    }

    const renderItemButton = (
        item: T,
        ancestorKeys: ReadonlySet<string | number> = new Set()
    ) => {
        const config = renderItem(item)
        const isGroup =
            config.buttonType === 'group' && !ancestorKeys.has(config.key)
        const groupChildren = isGroup ? (config.children ?? []) : []
        const childAncestorKeys = new Set(ancestorKeys).add(config.key)

        return (
            <NavigationButton
                key={config.key}
                active={selectedKey === config.key}
                href={config.href}
                label={config.label}
                subtitle={config.subtitle}
                tag={
                    config.tagLabel != null || config.tagCount != null
                        ? {
                              label: config.tagLabel,
                              count: config.tagCount,
                              labelClassName: config.tagClassName,
                          }
                        : undefined
                }
                subTags={config.subTags}
                icon={config.icon}
                buttonType={config.buttonType}
                groupContent={groupChildren.map((child) =>
                    renderItemButton(child, childAncestorKeys)
                )}
                hasActiveGroupChild={groupChildren.some(
                    (child) => renderItem(child).key === selectedKey
                )}
                onClick={config.onClick}
                showIndicator={false}
                className={cn(
                    styles.sidebarNavigationButton,
                    ancestorKeys.size > 0 && styles.sidebarNavigationButtonChild
                )}
            />
        )
    }

    return (
        <>
            {pinnedItems && pinnedItems.length > 0 && (
                <div className={styles.pinnedSection} data-pinned-section>
                    {pinnedItems.map((item) => renderItemButton(item))}
                </div>
            )}
            {items.map((item) => renderItemButton(item))}
        </>
    )
}
