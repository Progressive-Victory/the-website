'use client'

import styles from './Sidebar.module.css'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { useCurrentUser } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { useMediaQuery } from 'usehooks-ts'

export interface NavigationStackSlotProps {
    children?: ReactNode
    label?: string
    className?: string
}

export function Sidebar({
    children,
    label,
    className,
}: NavigationStackSlotProps): ReactElement {
    const pathname = usePathname()
    const [open, setOpen] = useState(true)
    const [indicatorLayoutSyncing, setIndicatorLayoutSyncing] = useState(false)
    const [indicatorStyle, setIndicatorStyle] = useState<{
        top: number
        height: number
        visible: boolean
    }>({ top: 0, height: 0, visible: false })
    const bodyRef = useRef<HTMLDivElement | null>(null)
    const indicatorLayoutSyncTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const isOpen = !isDesktop || open
    const mobileVisible = !pathname.startsWith('/admin/panels/')
    const featuredHref = isDesktop ? '/admin' : '/admin/panels/members'
    const currentUser = useCurrentUser()

    const displayName =
        `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim() ||
        (currentUser.data?.discordUsers?.[0]?.username
            ? `@${currentUser.data.discordUsers[0].username}`
            : 'Admin User')
    const discordUser = currentUser.data?.discordUsers?.[0]

    useEffect(() => {
        let frameId: number | null = null

        function syncIndicatorToLayout() {
            if (indicatorLayoutSyncTimeoutRef.current !== null) {
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)
            }

            setIndicatorLayoutSyncing(true)
            indicatorLayoutSyncTimeoutRef.current = setTimeout(() => {
                setIndicatorLayoutSyncing(false)
                indicatorLayoutSyncTimeoutRef.current = null
            }, 140)
        }

        function getActiveLink(bodyElement: HTMLDivElement) {
            return (
                bodyElement.querySelector<HTMLElement>(
                    '[data-indicator-target="true"]'
                ) ??
                bodyElement.querySelector<HTMLElement>('[aria-current="page"]')
            )
        }

        function updateIndicator() {
            const bodyElement = bodyRef.current

            if (!bodyElement) {
                return
            }

            const activeLink = getActiveLink(bodyElement)

            if (!activeLink) {
                setIndicatorStyle((previous) =>
                    previous.visible
                        ? { ...previous, visible: false }
                        : previous
                )
                return
            }

            let nextTop = 0
            let node: HTMLElement | null = activeLink

            while (node && node !== bodyElement) {
                nextTop += node.offsetTop
                node = node.offsetParent as HTMLElement | null
            }

            const nextHeight = activeLink.offsetHeight

            setIndicatorStyle((previous) => {
                const topChanged = Math.abs(previous.top - nextTop) > 0.5
                const heightChanged =
                    Math.abs(previous.height - nextHeight) > 0.5

                if (!topChanged && !heightChanged && previous.visible) {
                    return previous
                }

                return {
                    top: nextTop,
                    height: nextHeight,
                    visible: true,
                }
            })
        }

        function scheduleIndicatorSync() {
            if (frameId !== null) {
                return
            }

            frameId = requestAnimationFrame(() => {
                frameId = null
                updateIndicator()
            })
        }

        updateIndicator()
        window.addEventListener('resize', updateIndicator)

        const bodyElement = bodyRef.current
        const resizeObserver =
            typeof ResizeObserver === 'undefined' || !bodyElement
                ? null
                : new ResizeObserver(() => {
                      syncIndicatorToLayout()
                      scheduleIndicatorSync()
                  })
        const mutationObserver = bodyElement
            ? new MutationObserver(scheduleIndicatorSync)
            : null

        if (bodyElement) {
            resizeObserver?.observe(bodyElement)
        }

        if (bodyElement && mutationObserver) {
            mutationObserver.observe(bodyElement, {
                attributes: true,
                attributeFilter: [
                    'data-open',
                    'aria-current',
                    'data-indicator-target',
                    'class',
                ],
                childList: true,
                subtree: true,
            })
        }

        return () => {
            window.removeEventListener('resize', updateIndicator)
            resizeObserver?.disconnect()
            mutationObserver?.disconnect()

            if (indicatorLayoutSyncTimeoutRef.current !== null) {
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)
            }

            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [pathname, isDesktop, isOpen, children])

    return (
        <aside
            data-mobile-visible={mobileVisible}
            data-sidebar-collapsed={isDesktop && !isOpen}
            className={[
                styles.sidebar,
                isOpen ? styles.sidebarOpen : styles.sidebarClosed,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className={styles.header}>
                {label && isOpen ? (
                    <div className={styles.label}>{label}</div>
                ) : null}
            </div>
            <NavigationButton
                buttonType="account"
                href={featuredHref}
                iconNode={
                    <DiscordAvatar
                        discordUserId={discordUser?.id}
                        imageId={discordUser?.image}
                        size={40}
                    />
                }
                label={displayName}
                resetPanelHistoryOnClick={!isDesktop}
                subtitle={
                    discordUser?.username
                        ? `@${discordUser.username}`
                        : undefined
                }
            />
            <div className={styles.body} ref={bodyRef}>
                <div
                    aria-hidden="true"
                    className={styles.selectionIndicator}
                    data-layout-syncing={indicatorLayoutSyncing}
                    data-visible={indicatorStyle.visible}
                    style={{
                        top: `${indicatorStyle.top}px`,
                        height: `${indicatorStyle.height}px`,
                    }}
                />
                {children}
            </div>

            <div className={styles.footer}>
                <button
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    className={styles.toggleButton}
                    onClick={() => setOpen((previous) => !previous)}
                    title={isOpen ? 'Collapse' : 'Expand'}
                    type="button"
                >
                    <FiChevronLeft
                        className={[
                            styles.toggleIcon,
                            !isOpen ? styles.toggleIconClosed : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        size={20}
                    />
                </button>
            </div>
        </aside>
    )
}
