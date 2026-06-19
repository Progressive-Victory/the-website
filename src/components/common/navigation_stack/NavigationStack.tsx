'use client'

import styles from './NavigationStack.module.css'
import { Detail } from './detail/Detail'
import type { DetailProps } from './detail/Detail'
import { Sidebar } from './sidebar/Sidebar'
import { SidebarToggleButton } from './sidebar/Sidebar'
import type { NavigationStackSlotProps } from './sidebar/Sidebar'
import {
    Children,
    cloneElement,
    isValidElement,
    type ReactElement,
    type ReactNode,
} from 'react'

interface NavigationStackProps {
    children?: ReactNode
    className?: string
    sidebar?: ReactNode
    detail?: ReactNode
    unSelected?: ReactNode
    isSelected?: boolean
    overlay?: ReactNode
}

function isSplitViewSlot(
    child: ReactNode,
    slot: (props: NavigationStackSlotProps) => ReactElement | null
): child is ReactElement<NavigationStackSlotProps> {
    return isValidElement(child) && child.type === slot
}

function isDetailElement(child: ReactNode): child is ReactElement<DetailProps> {
    return isValidElement(child) && child.type === Detail
}

function BaseNavigationStack({
    children,
    className,
    sidebar,
    detail,
    unSelected,
    isSelected,
    overlay,
}: NavigationStackProps) {
    let sidebarSlotContent: ReactNode = null
    let detailSlotContent: ReactNode = null

    Children.forEach(children, (child) => {
        if (isSplitViewSlot(child, Sidebar)) {
            sidebarSlotContent = child
        }

        if (isSplitViewSlot(child, Detail)) {
            detailSlotContent = child
        }
    })

    const sidebarContent = sidebar ?? sidebarSlotContent
    const detailContent = detail ?? detailSlotContent
    const hasSelectedDetail =
        isSelected ?? (detailContent !== null && detailContent !== undefined)
    const detailClassName = isDetailElement(detailContent)
        ? detailContent.props.className
        : undefined
    let resolvedUnselected: ReactNode = unSelected ?? (
        <DefaultUnselectedView className={detailClassName} />
    )
    if (
        isDetailElement(resolvedUnselected) &&
        resolvedUnselected.props.body === undefined
    ) {
        resolvedUnselected = cloneElement(resolvedUnselected, {
            body: (
                <DefaultUnselectedView
                    className={resolvedUnselected.props.className}
                />
            ),
        })
    }
    const activeDetailContent = hasSelectedDetail
        ? detailContent
        : resolvedUnselected

    return (
        <div className={[styles.root, className].filter(Boolean).join(' ')}>
            {sidebarContent}
            {activeDetailContent}
            {overlay ? <div className={styles.overlay}>{overlay}</div> : null}
        </div>
    )
}

type NavigationStackComponent = ((
    props: NavigationStackProps
) => ReactElement) & {
    Sidebar: typeof Sidebar
    Detail: typeof Detail
}

export const NavigationStack = Object.assign(BaseNavigationStack, {
    Sidebar,
    Detail,
}) as NavigationStackComponent

export { SidebarToggleButton }

function DefaultUnselectedView({
    className,
}: {
    className?: string
}): ReactElement {
    return (
        <Detail
            bodyType="blank"
            className={className}
            body={
                <div className={styles.noContentView} role="status">
                    <h2 className={styles.noContentTitle}>Unselected</h2>
                    <p className={styles.noContentDescription}>
                        Select a panel from the sidebar to view its detail
                        content.
                    </p>
                </div>
            }
        />
    )
}
