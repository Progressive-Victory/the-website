'use client'

import styles from './Sidebar.module.css'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import { DropdownButton } from '@/components/common/dropdown/DropdownButton'
import { DropdownOverlay } from '@/components/common/dropdown/DropdownOverlay'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { useCurrentUser } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { useMediaQuery } from 'usehooks-ts'

type SidebarVariant = 'minimal' | 'prominent'
type SidebarVisualMode = 'minimal' | 'prominent' | 'prominent-bare'

interface IndicatorStyle {
    top: number
    height: number
    visible: boolean
}

interface SidebarBodyProps {
    bodyRef: React.RefObject<HTMLDivElement | null>
    indicatorLayoutSyncing: boolean
    indicatorStyle: IndicatorStyle
    showSelectionIndicator: boolean
    children?: ReactNode
}

interface SidebarToggleButtonProps {
    isOpen: boolean
    onToggle: () => void
    className?: string
    size?: number
}

interface MinimalSidebarHeaderProps {
    label?: string
    isOpen: boolean
}

interface ProminentSidebarHeaderProps {
    label?: string
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    filterOpen?: boolean
    onFilterOpenChange?: (open: boolean) => void
    filterContent?: ReactNode
    reserveToggleSpace: boolean
    largeTitle?: boolean
}

interface SidebarFooterProps {
    isOpen: boolean
    hiddenCollapsed: boolean
    onToggle: () => void
}

export interface NavigationStackSlotProps {
    children?: ReactNode
    featured?: ReactNode
    label?: string
    largeTitle?: boolean
    search?: ReactNode
    footer?: ReactNode
    includeHeader?: boolean
    sidebarWidth?: string
    filterOpen?: boolean
    onFilterOpenChange?: (open: boolean) => void
    filterContent?: ReactNode
    sidebarStyle?: SidebarVariant
    collapsedSidebarMode?: 'compact' | 'hidden'
    open?: boolean
    onOpenChange?: (open: boolean) => void
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    prominentHeader?: ReactNode
    mobileVisible?: boolean
    showScrollbar?: boolean
    showSelectionIndicator?: boolean
    className?: string
}

function cx(...parts: (string | false | undefined)[]): string {
    return parts.filter(Boolean).join(' ')
}

function getSidebarInlineStyle(
    sidebarWidth?: string
): CSSProperties | undefined {
    return sidebarWidth
        ? ({
              '--navigation-stack-sidebar-open-width': sidebarWidth,
          } as CSSProperties)
        : undefined
}

function getProminentSidebarVisualMode(
    includeHeader: boolean
): SidebarVisualMode {
    return includeHeader ? 'prominent' : 'prominent-bare'
}

function useSidebarOpenState(
    controlledOpen: boolean | undefined,
    onOpenChange?: (open: boolean) => void
): {
    isDesktop: boolean
    isOpen: boolean
    desktopOpen: boolean
    toggle: () => void
} {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const desktopOpen = controlledOpen ?? uncontrolledOpen
    const isOpen = !isDesktop || desktopOpen

    function toggle() {
        const nextOpen = !desktopOpen
        onOpenChange?.(nextOpen)
        if (controlledOpen === undefined) {
            setUncontrolledOpen(nextOpen)
        }
    }

    return { isDesktop, isOpen, desktopOpen, toggle }
}

function useSidebarIndicator(
    pathname: string,
    isDesktop: boolean,
    isOpen: boolean,
    enabled: boolean
): {
    bodyRef: React.RefObject<HTMLDivElement | null>
    indicatorLayoutSyncing: boolean
    indicatorStyle: IndicatorStyle
} {
    const [indicatorLayoutSyncing, setIndicatorLayoutSyncing] = useState(false)
    const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
        top: 0,
        height: 0,
        visible: false,
    })
    const bodyRef = useRef<HTMLDivElement | null>(null)
    const indicatorLayoutSyncTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    useEffect(() => {
        if (!enabled) {
            setIndicatorLayoutSyncing(false)
            setIndicatorStyle((previous) =>
                previous.visible ? { ...previous, visible: false } : previous
            )
            return
        }

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
                    '[data-indicator-target="true"]:not([data-show-indicator="false"])'
                ) ??
                bodyElement.querySelector<HTMLElement>(
                    '[aria-current="page"]:not([data-show-indicator="false"])'
                )
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
    }, [pathname, isDesktop, isOpen, enabled])

    return {
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
    }
}

function useLargeTitleScroll(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    titleRef: React.RefObject<HTMLElement | null>,
    enabled: boolean
): boolean {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setCollapsed((previous) => (previous ? false : previous))
            return
        }

        const scrollElement = scrollRef.current

        if (!scrollElement) {
            return
        }

        let frameId: number | null = null

        function evaluate() {
            frameId = null

            const element = scrollRef.current

            if (!element) {
                return
            }

            const collapseTrigger = 12
            const expandTrigger = 4

            setCollapsed((previous) => {
                if (!previous && element.scrollTop > collapseTrigger) {
                    return true
                }

                if (previous && element.scrollTop <= expandTrigger) {
                    return false
                }

                return previous
            })
        }

        function handleScroll() {
            if (frameId !== null) {
                return
            }

            frameId = requestAnimationFrame(evaluate)
        }

        scrollElement.addEventListener('scroll', handleScroll, {
            passive: true,
        })
        evaluate()

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll)

            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [enabled, scrollRef, titleRef])

    return enabled ? collapsed : false
}

export function Sidebar({
    sidebarStyle = 'minimal',
    ...props
}: NavigationStackSlotProps): ReactElement {
    if (sidebarStyle === 'prominent') {
        return <ProminentSidebar {...props} />
    }

    return <MinimalSidebar {...props} />
}

function MinimalSidebar({
    children,
    featured,
    label,
    sidebarWidth,
    collapsedSidebarMode = 'compact',
    open: controlledOpen,
    onOpenChange,
    mobileVisible,
    showScrollbar = true,
    showSelectionIndicator = false,
    className,
}: NavigationStackSlotProps): ReactElement {
    const pathname = usePathname()
    const visualMode: SidebarVisualMode = 'minimal'
    const { isDesktop, isOpen, toggle } = useSidebarOpenState(
        controlledOpen,
        onOpenChange
    )
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSidebarIndicator(pathname, isDesktop, isOpen, showSelectionIndicator)
    const hiddenCollapsed =
        isDesktop && !isOpen && collapsedSidebarMode === 'hidden'
    const resolvedMobileVisible =
        mobileVisible ?? !pathname.startsWith('/admin/panels/')
    const sidebarInlineStyle = getSidebarInlineStyle(sidebarWidth)

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={isDesktop && !isOpen}
            data-sidebar-header="minimal"
            data-sidebar-variant="minimal"
            data-sidebar-visual-mode={visualMode}
            style={sidebarInlineStyle}
            className={cx(
                styles.sidebar,
                styles.sidebarMinimal,
                isOpen ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed ? styles.sidebarHiddenCollapsed : '',
                className
            )}
        >
            <MinimalSidebarHeader label={label} isOpen={isOpen} />

            {featured}

            <div
                className={cx(
                    styles.sidebarBodyWrapper,
                    !showScrollbar && styles.sidebarBodyWrapperHideScrollbar
                )}
            >
                <SidebarBody
                    bodyRef={bodyRef}
                    indicatorLayoutSyncing={indicatorLayoutSyncing}
                    indicatorStyle={indicatorStyle}
                    showSelectionIndicator={showSelectionIndicator}
                >
                    {children}
                </SidebarBody>
            </div>

            <SidebarFooter
                isOpen={isOpen}
                hiddenCollapsed={hiddenCollapsed}
                onToggle={toggle}
            />
        </aside>
    )
}

function ProminentSidebar({
    children,
    featured,
    label,
    largeTitle = false,
    search,
    footer,
    includeHeader = true,
    sidebarWidth,
    filterOpen,
    onFilterOpenChange,
    filterContent,
    collapsedSidebarMode = 'compact',
    open: controlledOpen,
    prominentHeaderLeft,
    prominentHeaderRight,
    prominentHeader,
    mobileVisible,
    showScrollbar = true,
    showSelectionIndicator = false,
    className,
}: NavigationStackSlotProps): ReactElement {
    const pathname = usePathname()
    const visualMode = getProminentSidebarVisualMode(includeHeader)
    const { isDesktop, isOpen } = useSidebarOpenState(controlledOpen)
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSidebarIndicator(pathname, isDesktop, isOpen, showSelectionIndicator)
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const largeTitleRef = useRef<HTMLHeadingElement | null>(null)
    const collapsed = isDesktop && !isOpen
    const largeTitleActive = largeTitle
    const largeTitleEnabled = largeTitleActive && !collapsed
    const titleCollapsed = useLargeTitleScroll(
        scrollRef,
        largeTitleRef,
        largeTitleEnabled
    )
    const hiddenCollapsed =
        isDesktop && !isOpen && collapsedSidebarMode === 'hidden'
    const reserveProminentHeaderToggleSpace =
        isDesktop && collapsedSidebarMode === 'hidden'
    const shellClassName =
        visualMode === 'prominent-bare' ? styles.sidebarMinimal : undefined
    const surfaceClassName =
        visualMode === 'prominent' ? styles.sidebarProminent : undefined
    const sidebarInlineStyle = getSidebarInlineStyle(sidebarWidth)
    const resolvedMobileVisible = mobileVisible ?? true

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={collapsed}
            data-sidebar-header={includeHeader ? 'prominent' : 'bare'}
            data-sidebar-large-title={largeTitleActive}
            data-sidebar-large-title-collapsed={
                largeTitleActive && titleCollapsed
            }
            data-sidebar-variant="prominent"
            data-sidebar-visual-mode={visualMode}
            style={sidebarInlineStyle}
            className={cx(
                styles.sidebar,
                shellClassName,
                styles.sidebarWithProminentHeader,
                isOpen ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed ? styles.sidebarHiddenCollapsed : '',
                className
            )}
        >
            <ProminentSidebarHeader
                label={label}
                prominentHeader={prominentHeader}
                prominentHeaderLeft={prominentHeaderLeft}
                prominentHeaderRight={prominentHeaderRight}
                filterOpen={filterOpen}
                onFilterOpenChange={onFilterOpenChange}
                filterContent={filterContent}
                reserveToggleSpace={reserveProminentHeaderToggleSpace}
                largeTitle={largeTitleActive}
            />
            <div
                ref={scrollRef}
                className={cx(
                    styles.sidebarBodyWrapper,
                    !showScrollbar && styles.sidebarBodyWrapperHideScrollbar
                )}
            >
                <div className={surfaceClassName}>
                    {largeTitleActive ? (
                        <div
                            className={styles.largeTitleBlock}
                            data-collapsed={collapsed}
                        >
                            <h1
                                ref={largeTitleRef}
                                className={styles.largeTitle}
                            >
                                {label}
                            </h1>

                            {search ? (
                                <div className={styles.largeTitleSearch}>
                                    {search}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {featured}

                    <SidebarBody
                        bodyRef={bodyRef}
                        indicatorLayoutSyncing={indicatorLayoutSyncing}
                        indicatorStyle={indicatorStyle}
                        showSelectionIndicator={showSelectionIndicator}
                    >
                        {children}
                    </SidebarBody>
                </div>
            </div>
            {footer ? (
                <div className={styles.prominentFooter}>{footer}</div>
            ) : null}
        </aside>
    )
}

function MinimalSidebarHeader({
    label,
    isOpen,
}: MinimalSidebarHeaderProps): ReactElement {
    return (
        <div className={styles.header}>
            {label ? (
                <div
                    className={cx(
                        styles.label,
                        !isOpen && styles.labelCollapsed
                    )}
                >
                    {label}
                </div>
            ) : null}
        </div>
    )
}

function ProminentSidebarHeader({
    label,
    prominentHeader,
    prominentHeaderLeft,
    prominentHeaderRight,
    filterOpen,
    onFilterOpenChange,
    filterContent,
    reserveToggleSpace,
    largeTitle,
}: ProminentSidebarHeaderProps): ReactElement {
    if (prominentHeader) {
        return <>{prominentHeader}</>
    }

    const usesGeneratedFilterDropdown =
        prominentHeaderRight == null &&
        filterContent !== undefined &&
        filterContent !== null
    const usesGeneratedLegacyFilterToggle =
        prominentHeaderRight == null &&
        !usesGeneratedFilterDropdown &&
        typeof filterOpen === 'boolean' &&
        !!onFilterOpenChange
    const usesGeneratedFilterToggle =
        usesGeneratedFilterDropdown || usesGeneratedLegacyFilterToggle

    const resolvedHeaderRight =
        prominentHeaderRight ??
        (usesGeneratedFilterDropdown ? (
            <DropdownButton
                type="button"
                buttonVariant="icon"
                aria-label="Show Filters"
                title="Show Filters"
                icon={<IoMdOptions size={20} />}
                menu={({ closeDropdown }) => (
                    <DropdownOverlay
                        body={filterContent}
                        onClose={closeDropdown}
                    />
                )}
            />
        ) : usesGeneratedLegacyFilterToggle ? (
            <div className={styles.filterToggleSlot}>
                <button
                    className={styles.filterToggleButton}
                    title={filterOpen ? 'Hide Filters' : 'Show Filters'}
                    onClick={() => onFilterOpenChange(!filterOpen)}
                    type="button"
                >
                    {filterOpen ? (
                        <IoClose size={20} />
                    ) : (
                        <IoMdOptions size={20} />
                    )}
                </button>
            </div>
        ) : null)

    return (
        <div className={styles.panelHeader}>
            <div
                className={cx(
                    styles.panelHeaderLeft,
                    reserveToggleSpace && styles.panelHeaderLeftShifted
                )}
            >
                {prominentHeaderLeft ?? (
                    <div className={styles.breadcrumbs}>
                        <span
                            className={styles.prominentBreadcrumb}
                            data-large-title={largeTitle}
                        >
                            {label}
                        </span>
                    </div>
                )}
            </div>

            <div
                className={cx(
                    styles.panelHeaderRight,
                    usesGeneratedFilterToggle &&
                        styles.panelHeaderRightFilterToggle
                )}
            >
                {resolvedHeaderRight}
            </div>
        </div>
    )
}

export function SidebarFeatured(): ReactElement {
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const featuredHref = isDesktop ? '/admin' : '/admin/panels/members'
    const currentUser = useCurrentUser()
    const displayName =
        `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim() ||
        (currentUser.data?.discordUsers?.[0]?.username
            ? `@${currentUser.data.discordUsers[0].username}`
            : 'Admin User')
    const discordUser = currentUser.data?.discordUsers?.[0]

    return (
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
                discordUser?.username ? `@${discordUser.username}` : undefined
            }
        />
    )
}

function SidebarBody({
    bodyRef,
    indicatorLayoutSyncing,
    indicatorStyle,
    showSelectionIndicator,
    children,
}: SidebarBodyProps): ReactElement {
    return (
        <div className={styles.body} ref={bodyRef}>
            {showSelectionIndicator ? (
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
            ) : null}
            {children}
        </div>
    )
}

function SidebarFooter({
    isOpen,
    hiddenCollapsed,
    onToggle,
}: SidebarFooterProps): ReactElement {
    if (hiddenCollapsed) {
        return <div className={styles.footer} />
    }

    return (
        <div className={styles.footer}>
            <SidebarToggleButton
                isOpen={isOpen}
                onToggle={onToggle}
                className={styles.toggleButton}
                size={20}
            />
        </div>
    )
}

interface SidebarToggleButtonProps {
    isOpen: boolean
    onToggle: () => void
    className?: string
    size?: number
}

export function SidebarToggleButton({
    isOpen,
    onToggle,
    className,
    size = 18,
}: SidebarToggleButtonProps): ReactElement {
    return (
        <button
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={[styles.panelToggleButton, className]
                .filter(Boolean)
                .join(' ')}
            onClick={onToggle}
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
                size={size}
            />
        </button>
    )
}
