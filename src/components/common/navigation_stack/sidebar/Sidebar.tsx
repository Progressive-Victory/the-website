'use client'

import styles from './Sidebar.module.css'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import { DropdownButton } from '@/components/common/dropdown/DropdownButton'
import { DropdownOverlay } from '@/components/common/dropdown/DropdownOverlay'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { useCurrentUser } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { Children, isValidElement, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { useMediaQuery } from 'usehooks-ts'

type SidebarVariant = 'minimal' | 'prominent'
type SidebarVisualMode = 'minimal' | 'prominent' | 'prominent-bare'
type SidebarHeaderMode = 'shown' | 'hidden'

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

export interface SidebarRootProps {
    label?: string
    variant?: SidebarVariant
    width?: string
    collapsedWidth?: string
    collapsedMode?: 'compact' | 'hidden'
    open?: boolean
    onOpenChange?: (open: boolean) => void
    mobileVisible?: boolean
    showScrollbar?: boolean
    showFooterToggle?: boolean
    hideFooterWhenCollapsed?: boolean
    keepBorderWhenCollapsed?: boolean
    reserveHeaderToggleSpace?: boolean
    showSelectionIndicator?: boolean
    className?: string
    children?: ReactNode
}

export type NavigationStackSlotProps = SidebarRootProps

export interface SidebarHeaderSlotProps {
    mode?: SidebarHeaderMode
    label?: string
    largeTitle?: boolean
    children?: ReactNode
}

export interface SidebarHeaderFiltersSlotProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    content?: ReactNode
    children?: ReactNode
}

interface SidebarNamedSlotProps {
    children?: ReactNode
}

interface ParsedHeaderSlots {
    left?: ReactNode
    right?: ReactNode
    content?: ReactNode
    search?: ReactNode
    filters?: SidebarHeaderFiltersSlotProps
}

interface ResolvedHeaderProps {
    mode: SidebarHeaderMode
    label?: string
    largeTitle?: boolean
    search?: ReactNode
    filterOpen?: boolean
    onFilterOpenChange?: (open: boolean) => void
    filterContent?: ReactNode
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
}

interface ResolvedSidebarProps {
    variant: SidebarVariant
    width?: string
    collapsedWidth?: string
    collapsedMode: 'compact' | 'hidden'
    open?: boolean
    onOpenChange?: (open: boolean) => void
    mobileVisible?: boolean
    showScrollbar: boolean
    showFooterToggle: boolean
    hideFooterWhenCollapsed: boolean
    keepBorderWhenCollapsed: boolean
    reserveHeaderToggleSpace: boolean
    showSelectionIndicator: boolean
    className?: string
    header: ResolvedHeaderProps
    featured?: ReactNode
    body?: ReactNode
    footer?: ReactNode
}

interface SidebarComponent {
    (props: SidebarRootProps): ReactElement
    Header: (props: SidebarHeaderSlotProps) => ReactElement | null
    HeaderLeft: (props: SidebarNamedSlotProps) => ReactElement | null
    HeaderRight: (props: SidebarNamedSlotProps) => ReactElement | null
    HeaderContent: (props: SidebarNamedSlotProps) => ReactElement | null
    HeaderSearch: (props: SidebarNamedSlotProps) => ReactElement | null
    HeaderFilters: (props: SidebarHeaderFiltersSlotProps) => ReactElement | null
    Featured: (props: SidebarNamedSlotProps) => ReactElement | null
    Body: (props: SidebarNamedSlotProps) => ReactElement | null
    Footer: (props: SidebarNamedSlotProps) => ReactElement | null
}

interface SidebarSlotElementProps {
    children?: ReactNode
}

function SidebarHeaderSlot(_: SidebarHeaderSlotProps): ReactElement | null {
    return null
}

function SidebarHeaderLeftSlot(_: SidebarNamedSlotProps): ReactElement | null {
    return null
}

function SidebarHeaderRightSlot(_: SidebarNamedSlotProps): ReactElement | null {
    return null
}

function SidebarHeaderContentSlot(
    _: SidebarNamedSlotProps
): ReactElement | null {
    return null
}

function SidebarHeaderSearchSlot(
    _: SidebarNamedSlotProps
): ReactElement | null {
    return null
}

function SidebarHeaderFiltersSlot(
    _: SidebarHeaderFiltersSlotProps
): ReactElement | null {
    return null
}

function SidebarFeaturedSlot(_: SidebarNamedSlotProps): ReactElement | null {
    return null
}

function SidebarBodySlot(_: SidebarNamedSlotProps): ReactElement | null {
    return null
}

function SidebarFooterSlot(_: SidebarNamedSlotProps): ReactElement | null {
    return null
}

function parseHeaderSlots(children: ReactNode): ParsedHeaderSlots {
    const contentNodes: ReactNode[] = []
    const parsed: ParsedHeaderSlots = {}

    for (const child of Children.toArray(children)) {
        if (!isValidElement(child)) {
            contentNodes.push(child)
            continue
        }

        if (child.type === SidebarHeaderLeftSlot) {
            parsed.left = (child.props as SidebarSlotElementProps).children
            continue
        }

        if (child.type === SidebarHeaderRightSlot) {
            parsed.right = (child.props as SidebarSlotElementProps).children
            continue
        }

        if (child.type === SidebarHeaderContentSlot) {
            parsed.content = (child.props as SidebarSlotElementProps).children
            continue
        }

        if (child.type === SidebarHeaderSearchSlot) {
            parsed.search = (child.props as SidebarSlotElementProps).children
            continue
        }

        if (child.type === SidebarHeaderFiltersSlot) {
            const filtersProps = child.props as SidebarHeaderFiltersSlotProps
            parsed.filters = {
                open: filtersProps.open,
                onOpenChange: filtersProps.onOpenChange,
                content: filtersProps.content ?? filtersProps.children,
            }
            continue
        }

        contentNodes.push(child)
    }

    if (contentNodes.length > 0) {
        parsed.content = <>{contentNodes}</>
    }

    return parsed
}

function resolveHeaderProps(
    rootLabel: string | undefined,
    headerSlot: SidebarHeaderSlotProps | undefined,
    variant: SidebarVariant
): ResolvedHeaderProps {
    const nestedSlots = parseHeaderSlots(headerSlot?.children)

    return {
        mode:
            headerSlot?.mode ?? (variant === 'prominent' ? 'hidden' : 'shown'),
        label: headerSlot?.label ?? rootLabel,
        largeTitle: headerSlot?.largeTitle ?? false,
        search: nestedSlots.search,
        filterOpen: nestedSlots.filters?.open,
        onFilterOpenChange: nestedSlots.filters?.onOpenChange,
        filterContent: nestedSlots.filters?.content,
        prominentHeader: nestedSlots.content,
        prominentHeaderLeft: nestedSlots.left,
        prominentHeaderRight: nestedSlots.right,
    }
}

function resolveSidebarProps(props: SidebarRootProps): ResolvedSidebarProps {
    const variant = props.variant ?? 'minimal'
    let headerSlot: SidebarHeaderSlotProps | undefined
    let featured: ReactNode
    let footer: ReactNode
    const bodyNodes: ReactNode[] = []

    for (const child of Children.toArray(props.children)) {
        if (!isValidElement(child)) {
            bodyNodes.push(child)
            continue
        }

        if (child.type === SidebarHeaderSlot) {
            headerSlot = child.props as SidebarHeaderSlotProps
            continue
        }

        if (child.type === SidebarFeaturedSlot) {
            featured = (child.props as SidebarSlotElementProps).children
            continue
        }

        if (child.type === SidebarBodySlot) {
            bodyNodes.push((child.props as SidebarSlotElementProps).children)
            continue
        }

        if (child.type === SidebarFooterSlot) {
            footer = (child.props as SidebarSlotElementProps).children
            continue
        }

        bodyNodes.push(child)
    }

    const body = bodyNodes.length > 0 ? <>{bodyNodes}</> : undefined

    return {
        variant,
        width: props.width,
        collapsedWidth: props.collapsedWidth,
        collapsedMode: props.collapsedMode ?? 'compact',
        open: props.open,
        onOpenChange: props.onOpenChange,
        mobileVisible: props.mobileVisible,
        showScrollbar: props.showScrollbar ?? true,
        showFooterToggle: props.showFooterToggle ?? true,
        hideFooterWhenCollapsed: props.hideFooterWhenCollapsed ?? false,
        keepBorderWhenCollapsed: props.keepBorderWhenCollapsed ?? false,
        reserveHeaderToggleSpace: props.reserveHeaderToggleSpace ?? false,
        showSelectionIndicator: props.showSelectionIndicator ?? false,
        className: props.className,
        header: resolveHeaderProps(props.label, headerSlot, variant),
        featured,
        body,
        footer,
    }
}

function cx(...parts: (string | false | undefined)[]): string {
    return parts.filter(Boolean).join(' ')
}

function getSidebarInlineStyle(
    sidebarWidth?: string,
    collapsedWidth?: string
): CSSProperties | undefined {
    if (!sidebarWidth && !collapsedWidth) return undefined
    const style: Record<string, string> = {}
    if (sidebarWidth)
        style['--navigation-stack-sidebar-open-width'] = sidebarWidth
    if (collapsedWidth)
        style['--navigation-stack-sidebar-collapsed-width'] = collapsedWidth
    return style as CSSProperties
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

function SidebarRoot(sidebarProps: SidebarRootProps): ReactElement {
    const props = resolveSidebarProps(sidebarProps)

    if (props.variant === 'prominent') {
        return <ProminentSidebar {...props} />
    }

    return <MinimalSidebar {...props} />
}

export const Sidebar = Object.assign(SidebarRoot, {
    Header: SidebarHeaderSlot,
    HeaderLeft: SidebarHeaderLeftSlot,
    HeaderRight: SidebarHeaderRightSlot,
    HeaderContent: SidebarHeaderContentSlot,
    HeaderSearch: SidebarHeaderSearchSlot,
    HeaderFilters: SidebarHeaderFiltersSlot,
    Featured: SidebarFeaturedSlot,
    Body: SidebarBodySlot,
    Footer: SidebarFooterSlot,
}) as SidebarComponent

function MinimalSidebar({
    body,
    featured,
    width,
    collapsedWidth,
    collapsedMode,
    open: controlledOpen,
    onOpenChange,
    mobileVisible,
    showScrollbar,
    showFooterToggle,
    hideFooterWhenCollapsed,
    keepBorderWhenCollapsed,
    showSelectionIndicator,
    className,
    header,
}: ResolvedSidebarProps): ReactElement {
    const pathname = usePathname()
    const visualMode: SidebarVisualMode = 'minimal'
    const { isDesktop, isOpen, toggle } = useSidebarOpenState(
        controlledOpen,
        onOpenChange
    )
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSidebarIndicator(pathname, isDesktop, isOpen, showSelectionIndicator)
    const hiddenCollapsed = isDesktop && !isOpen && collapsedMode === 'hidden'
    const resolvedMobileVisible =
        mobileVisible ?? !pathname.startsWith('/admin/panels/')
    const sidebarInlineStyle = getSidebarInlineStyle(width, collapsedWidth)

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={isDesktop && !isOpen}
            data-hide-footer-when-collapsed={hideFooterWhenCollapsed}
            data-keep-border-when-collapsed={keepBorderWhenCollapsed}
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
            <MinimalSidebarHeader label={header.label} isOpen={isOpen} />

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
                    {body}
                </SidebarBody>
            </div>

            {showFooterToggle ? (
                <SidebarFooter
                    isOpen={isOpen}
                    hiddenCollapsed={hiddenCollapsed}
                    onToggle={toggle}
                />
            ) : null}
        </aside>
    )
}

function ProminentSidebar({
    body,
    featured,
    footer,
    width,
    collapsedWidth,
    collapsedMode,
    open: controlledOpen,
    onOpenChange,
    mobileVisible,
    showScrollbar,
    showFooterToggle,
    hideFooterWhenCollapsed,
    keepBorderWhenCollapsed,
    reserveHeaderToggleSpace,
    showSelectionIndicator,
    className,
    header,
}: ResolvedSidebarProps): ReactElement {
    const pathname = usePathname()
    const includeHeader = header.mode !== 'hidden'
    const visualMode = getProminentSidebarVisualMode(includeHeader)
    const { isDesktop, isOpen, toggle } = useSidebarOpenState(
        controlledOpen,
        onOpenChange
    )
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSidebarIndicator(pathname, isDesktop, isOpen, showSelectionIndicator)
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const largeTitleRef = useRef<HTMLHeadingElement | null>(null)
    const collapsed = isDesktop && !isOpen
    const largeTitleActive = header.largeTitle ?? false
    const largeTitleEnabled = largeTitleActive && !collapsed
    const titleCollapsed = useLargeTitleScroll(
        scrollRef,
        largeTitleRef,
        largeTitleEnabled
    )
    const hiddenCollapsed = isDesktop && !isOpen && collapsedMode === 'hidden'
    const reserveProminentHeaderToggleSpace =
        isDesktop && reserveHeaderToggleSpace
    const shellClassName =
        visualMode === 'prominent-bare' ? styles.sidebarMinimal : undefined
    const surfaceClassName =
        visualMode === 'prominent' ? styles.sidebarProminent : undefined
    const sidebarInlineStyle = getSidebarInlineStyle(width, collapsedWidth)
    const resolvedMobileVisible = mobileVisible ?? true

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={collapsed}
            data-hide-footer-when-collapsed={hideFooterWhenCollapsed}
            data-keep-border-when-collapsed={keepBorderWhenCollapsed}
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
                label={header.label}
                prominentHeader={header.prominentHeader}
                prominentHeaderLeft={header.prominentHeaderLeft}
                prominentHeaderRight={header.prominentHeaderRight}
                filterOpen={header.filterOpen}
                onFilterOpenChange={header.onFilterOpenChange}
                filterContent={header.filterContent}
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
                            data-reserve-toggle-space={
                                reserveProminentHeaderToggleSpace
                            }
                        >
                            <h1
                                ref={largeTitleRef}
                                className={styles.largeTitle}
                            >
                                {header.label}
                            </h1>

                            {header.search ? (
                                <div className={styles.largeTitleSearch}>
                                    {header.search}
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
                        {body}
                    </SidebarBody>
                </div>
            </div>
            {footer ? (
                <div className={styles.prominentFooter}>{footer}</div>
            ) : null}
            {showFooterToggle ? (
                <SidebarFooter
                    isOpen={isOpen}
                    hiddenCollapsed={hiddenCollapsed}
                    onToggle={toggle}
                />
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
