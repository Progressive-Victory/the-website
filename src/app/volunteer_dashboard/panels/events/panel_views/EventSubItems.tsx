'use client'

import styles from './panels.module.css'
import { CollapsibleSection } from '@/components/common'
import { FormField, FormGroup, TextField } from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { cn } from '@/util'
import { redirect, RedirectType, usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface EventItemsProps<T> {
    items: T[]
    generators: {
        href?: (seed: T, index?: number) => string
        key?: (seed: T, index?: number) => string
        label?: (seed: T, index?: number) => string
        subtitle?: (seed: T, index?: number) => string
        className?: (seed: T, index?: number) => string
        icon?: (seed: T, index?: number) => ReactNode
        tag?: (seed: T, index?: number) => ReactNode
    }
}

export default function EventSubItems<T extends object>({
    items,
    generators,
}: EventItemsProps<T>) {
    const pathname = usePathname()
    const handleSelectItem = (item: T, index: number) => {
        if (!generators.href) return

        const itemHref = generators.href?.(item, index)
        // redirect to user pane
        // `/admin/panels/members${item.discordUser ? `?id=${item.discordUser.userId}` : ''}`,
        redirect(itemHref, RedirectType.push)
    }

    const renderItem = (item: T, index: number) => {
        const key = generators.key?.(item, index) ?? ''
        const href = generators.href?.(item, index) ?? ''
        const label = generators.label?.(item, index) ?? ''
        const subtitle = generators.subtitle?.(item, index) ?? ''
        const className = generators.className?.(item, index) ?? ''

        return (
            // <NavigationButton
            //     // key={[item.userDiscordId, index].join()}
            //     key={key}
            //     className={cn(styles.listItem, className)}
            //     buttonType="account"
            //     onClick={() => handleSelectItem(item, index)}
            //     active={pathname === href}
            //     href={href}
            //     // label={`@${item.discordUser?.username}`}
            //     label={label}
            //     subtitle={subtitle}
            //     renderTag={generators.tag?.(item, index) ?? undefined}
            //     icon={
            //         generators.icon?.(item, index) ?? undefined
            //         // <DiscordAvatar
            //         //     discordUserId={item.discordUser?.id}
            //         //     imageId={item.discordUser?.image}
            //         //     size={32}
            //         // />
            //     }
            //     resetPanelHistoryOnClick
            // />
            <FormGroup
                key={[key, index].join()}
                title={label}
                subtitle={subtitle}
                subGroup={true}
                defaultCollapsed={true}
            >
                {Object.keys(item).map((field) => (
                    <FormField label={field} key={[key, field, index].join()}>
                        <span>{String(item[field])}</span>
                    </FormField>
                ))}
            </FormGroup>
        )
    }

    if (items.length === 0)
        return <span className={styles.readonly}>No items found.</span>

    return (
        <div className={styles.itemList}>{(items ?? []).map(renderItem)}</div>
    )
}
