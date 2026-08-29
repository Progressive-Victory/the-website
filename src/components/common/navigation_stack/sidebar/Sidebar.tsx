'use client'

import { SelectionIndicator } from './SelectionIndicator'
import type { IndicatorStyle } from './SelectionIndicator'
import styles from './Sidebar.module.css'
import { SidebarToggleButton } from './SidebarToggleButton'
import { useLargeTitleScroll, useSidebarState } from './hooks'
import { DropdownButton } from '@/components/common/dropdown/DropdownButton'
import { DropdownOverlay } from '@/components/common/dropdown/DropdownOverlay'
import { cn } from '@/util'
import { useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'

type SidebarVariant = 'minimal' | 'prominent'
type SidebarVisualMode = 'minimal' | 'prominent' | 'prominent-bare'
type SidebarHeaderMode = 'shown' | 'hidden'

export interface SidebarFiltersConfig {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    content?: ReactNode
}

export interface SidebarHeaderConfig {
    mode?: SidebarHeaderMode
    label?: string
    largeTitle?: boolean
    content?: ReactNode
    left?: ReactNode
    right?: ReactNode
    search?: ReactNode
    filters?: SidebarFiltersConfig
}

export interface SidebarProps {
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
    header?: SidebarHeaderConfig
    featured?: ReactNode
    footer?: ReactNode
    children?: ReactNode
}

export type NavigationStackSlotProps = SidebarProps

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

function resolveSidebarProps(props: SidebarProps): ResolvedSidebarProps {
    const variant = props.variant ?? 'minimal'
    const h = props.header

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
        header: {
            mode: h?.mode ?? (variant === 'prominent' ? 'hidden' : 'shown'),
            label: h?.label ?? props.label,
            largeTitle: h?.largeTitle ?? false,
            search: h?.search,
            filterOpen: h?.filters?.open,
            onFilterOpenChange: h?.filters?.onOpenChange,
            filterContent: h?.filters?.content,
            prominentHeader: h?.content,
            prominentHeaderLeft: h?.left,
            prominentHeaderRight: h?.right,
        },
        featured: props.featured,
        body: props.children,
        footer: props.footer,
    }
}

function getProminentSidebarVisualMode(
    includeHeader: boolean
): SidebarVisualMode {
    return includeHeader ? 'prominent' : 'prominent-bare'
}

export function Sidebar(props: SidebarProps): ReactElement {
    const resolved = resolveSidebarProps(props)

    if (resolved.variant === 'prominent') {
        return <ProminentSidebar {...resolved} />
    }

    return <MinimalSidebar {...resolved} />
}

function MinimalSidebar({
    body,
    featured,
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
    width,
    collapsedWidth,
}: ResolvedSidebarProps): ReactElement {
    const {
        pathname,
        isDesktop,
        isOpen,
        toggle,
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
        hiddenCollapsed,
        sidebarInlineStyle,
    } = useSidebarState(
        controlledOpen,
        onOpenChange,
        showSelectionIndicator,
        collapsedMode,
        width,
        collapsedWidth
    )
    const resolvedMobileVisible =
        mobileVisible ?? !pathname.startsWith('/volunteer_dashboard/panels/')

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={isDesktop && !isOpen}
            data-hide-footer-when-collapsed={hideFooterWhenCollapsed}
            data-keep-border-when-collapsed={keepBorderWhenCollapsed}
            data-sidebar-header="minimal"
            data-sidebar-variant="minimal"
            data-sidebar-visual-mode="minimal"
            style={sidebarInlineStyle}
            className={cn(
                styles.sidebar,
                styles.sidebarMinimal,
                isOpen ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed && styles.sidebarHiddenCollapsed,
                className
            )}
        >
            <MinimalSidebarHeader label={header.label} isOpen={isOpen} />

            {featured}

            <div
                className={cn(
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

            {showFooterToggle && (
                <SidebarFooter
                    isOpen={isOpen}
                    hiddenCollapsed={hiddenCollapsed}
                    onToggle={toggle}
                />
            )}
        </aside>
    )
}

function ProminentSidebar({
    body,
    featured,
    footer,
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
    width,
    collapsedWidth,
}: ResolvedSidebarProps): ReactElement {
    const {
        isDesktop,
        isOpen,
        collapsed,
        toggle,
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
        hiddenCollapsed,
        sidebarInlineStyle,
    } = useSidebarState(
        controlledOpen,
        onOpenChange,
        showSelectionIndicator,
        collapsedMode,
        width,
        collapsedWidth
    )
    const includeHeader = header.mode !== 'hidden'
    const visualMode = getProminentSidebarVisualMode(includeHeader)
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const largeTitleRef = useRef<HTMLHeadingElement | null>(null)
    const largeTitleActive = header.largeTitle ?? false
    const largeTitleEnabled = largeTitleActive && !collapsed
    const titleCollapsed = useLargeTitleScroll(
        scrollRef,
        largeTitleRef,
        largeTitleEnabled
    )
    const reserveProminentHeaderToggleSpace =
        isDesktop && reserveHeaderToggleSpace
    const shellClassName =
        visualMode === 'prominent-bare' ? styles.sidebarMinimal : undefined
    const surfaceClassName =
        visualMode === 'prominent' ? styles.sidebarProminent : undefined
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
            className={cn(
                styles.sidebar,
                shellClassName,
                styles.sidebarWithProminentHeader,
                isOpen ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed && styles.sidebarHiddenCollapsed,
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
                className={cn(
                    styles.sidebarBodyWrapper,
                    !showScrollbar && styles.sidebarBodyWrapperHideScrollbar
                )}
            >
                <div className={surfaceClassName}>
                    {largeTitleActive && (
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

                            {header.search && (
                                <div className={styles.largeTitleSearch}>
                                    {header.search}
                                </div>
                            )}
                        </div>
                    )}

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
            {footer && <div className={styles.prominentFooter}>{footer}</div>}
            {showFooterToggle && (
                <SidebarFooter
                    isOpen={isOpen}
                    hiddenCollapsed={hiddenCollapsed}
                    onToggle={toggle}
                />
            )}
        </aside>
    )
}

interface MinimalSidebarHeaderProps {
    label?: string
    isOpen: boolean
}

function MinimalSidebarHeader({
    label,
    isOpen,
}: MinimalSidebarHeaderProps): ReactElement {
    return (
        <div className={styles.header}>
            {label && (
                <div
                    className={cn(
                        styles.label,
                        !isOpen && styles.labelCollapsed
                    )}
                >
                    {label}
                </div>
            )}
        </div>
    )
}

function resolveHeaderRight(
    custom: ReactNode,
    filterContent: ReactNode,
    filterOpen: boolean | undefined,
    onFilterOpenChange: ((open: boolean) => void) | undefined
): { element: ReactNode; isGenerated: boolean } {
    if (custom != null) {
        return { element: custom, isGenerated: false }
    }

    if (filterContent != null) {
        return {
            element: (
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
            ),
            isGenerated: true,
        }
    }

    if (typeof filterOpen === 'boolean' && onFilterOpenChange) {
        return {
            element: (
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
            ),
            isGenerated: true,
        }
    }

    return { element: null, isGenerated: false }
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

    const { element: resolvedHeaderRight, isGenerated } = resolveHeaderRight(
        prominentHeaderRight,
        filterContent,
        filterOpen,
        onFilterOpenChange
    )

    return (
        <div className={styles.panelHeader}>
            <div
                className={cn(
                    styles.panelHeaderLeft,
                    reserveToggleSpace && styles.panelHeaderLeftShifted
                )}
            >
                {prominentHeaderLeft}
                <div className={styles.breadcrumbs}>
                    <span
                        className={styles.prominentBreadcrumb}
                        data-large-title={largeTitle}
                    >
                        {label}
                    </span>
                </div>
            </div>

            <div
                className={cn(
                    styles.panelHeaderRight,
                    isGenerated && styles.panelHeaderRightFilterToggle
                )}
            >
                {resolvedHeaderRight}
            </div>
        </div>
    )
}

interface SidebarBodyProps {
    bodyRef: React.RefObject<HTMLDivElement | null>
    indicatorLayoutSyncing: boolean
    indicatorStyle: IndicatorStyle
    showSelectionIndicator: boolean
    children?: ReactNode
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
            {showSelectionIndicator && (
                <SelectionIndicator
                    layoutSyncing={indicatorLayoutSyncing}
                    style={indicatorStyle}
                />
            )}
            {children}
        </div>
    )
}

interface SidebarFooterProps {
    isOpen: boolean
    hiddenCollapsed: boolean
    onToggle: () => void
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
                variant="chevron"
            />
        </div>
    )
}
