'use client'

import { SelectionIndicator } from './SelectionIndicator'
import styles from './Sidebar.module.css'
import { SidebarToggleButton } from './SidebarToggleButton'
import type { IndicatorStyle } from './hooks'
import {
    useLargeTitleScroll,
    usePinnedSectionStuck,
    useSidebarState,
} from './hooks'
import {
    DropdownButton,
    type DropdownButtonVariant,
} from '@/components/common/dropdown/DropdownButton'
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
}

export type SidebarHeaderButtonMenu =
    ReactNode | ((controls: { close: () => void }) => ReactNode)

export interface SidebarHeaderButtonConfig {
    menu?: SidebarHeaderButtonMenu
    onClick?: () => void
    icon?: ReactNode
    label?: string
    buttonVariant?: DropdownButtonVariant
    className?: string
}

export interface SidebarHeaderConfig {
    mode?: SidebarHeaderMode
    label?: string
    largeTitle?: boolean
    content?: ReactNode
    left?: ReactNode
    right?: ReactNode
    button?: SidebarHeaderButtonConfig
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
    showFooterWhenCollapsed?: boolean
    showBorderWhenCollapsed?: boolean
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
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    prominentHeaderButton?: SidebarHeaderButtonConfig
}

type ResolvedSidebarProps = Omit<
    SidebarProps,
    | 'variant'
    | 'collapsedMode'
    | 'showScrollbar'
    | 'showFooterToggle'
    | 'showFooterWhenCollapsed'
    | 'showBorderWhenCollapsed'
    | 'reserveHeaderToggleSpace'
    | 'showSelectionIndicator'
    | 'header'
    | 'children'
> & {
    variant: SidebarVariant
    collapsedMode: 'compact' | 'hidden'
    showScrollbar: boolean
    showFooterToggle: boolean
    showFooterWhenCollapsed: boolean
    showBorderWhenCollapsed: boolean
    reserveHeaderToggleSpace: boolean
    showSelectionIndicator: boolean
    header: ResolvedHeaderProps
    body?: ReactNode
}

function resolveSidebarProps(props: SidebarProps): ResolvedSidebarProps {
    const { children: body, header: inputHeader, ...rest } = props
    const variant = props.variant ?? 'minimal'
    const h = inputHeader

    return {
        ...rest,
        variant,
        collapsedMode: props.collapsedMode ?? 'compact',
        showScrollbar: props.showScrollbar ?? true,
        showFooterToggle: props.showFooterToggle ?? true,
        showFooterWhenCollapsed: props.showFooterWhenCollapsed ?? true,
        showBorderWhenCollapsed: props.showBorderWhenCollapsed ?? false,
        reserveHeaderToggleSpace: props.reserveHeaderToggleSpace ?? false,
        showSelectionIndicator: props.showSelectionIndicator ?? false,
        header: {
            mode: h?.mode ?? (variant === 'prominent' ? 'hidden' : 'shown'),
            label: h?.label ?? props.label,
            largeTitle: h?.largeTitle ?? false,
            search: h?.search,
            filterOpen: h?.filters?.open,
            onFilterOpenChange: h?.filters?.onOpenChange,
            prominentHeader: h?.content,
            prominentHeaderLeft: h?.left,
            prominentHeaderRight: h?.right,
            prominentHeaderButton: h?.button,
        },
        body,
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
    showFooterWhenCollapsed,
    showBorderWhenCollapsed,
    showSelectionIndicator,
    className,
    header,
    width,
    collapsedWidth,
}: ResolvedSidebarProps): ReactElement {
    const {
        pathname,
        isDesktop,
        isExpanded,
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
            data-sidebar-collapsed={isDesktop && !isExpanded}
            data-hide-footer-when-collapsed={!showFooterWhenCollapsed}
            data-keep-border-when-collapsed={showBorderWhenCollapsed}
            data-sidebar-header="minimal"
            data-sidebar-variant="minimal"
            data-sidebar-visual-mode="minimal"
            style={sidebarInlineStyle}
            className={cn(
                styles.sidebar,
                styles.sidebarMinimal,
                isExpanded ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed && styles.sidebarHiddenCollapsed,
                className
            )}
        >
            <MinimalSidebarHeader label={header.label} isOpen={isExpanded} />

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
                <SidebarToggleFooter
                    isOpen={isExpanded}
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
    showFooterWhenCollapsed,
    showBorderWhenCollapsed,
    reserveHeaderToggleSpace,
    showSelectionIndicator,
    className,
    header,
    width,
    collapsedWidth,
}: ResolvedSidebarProps): ReactElement {
    const {
        isDesktop,
        isExpanded,
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
    const pinnedSectionStuck = usePinnedSectionStuck(scrollRef, true)
    const reserveProminentHeaderToggleSpace =
        isDesktop && reserveHeaderToggleSpace
    const resolvedMobileVisible = mobileVisible ?? true

    return (
        <aside
            data-mobile-visible={resolvedMobileVisible}
            data-sidebar-collapsed={collapsed}
            data-hide-footer-when-collapsed={!showFooterWhenCollapsed}
            data-keep-border-when-collapsed={showBorderWhenCollapsed}
            data-sidebar-header={includeHeader ? 'prominent' : 'bare'}
            data-sidebar-large-title={largeTitleActive}
            data-sidebar-large-title-collapsed={
                largeTitleActive && titleCollapsed
            }
            data-sidebar-pinned-stuck={pinnedSectionStuck}
            data-sidebar-variant="prominent"
            data-sidebar-visual-mode={visualMode}
            style={sidebarInlineStyle}
            className={cn(
                styles.sidebar,
                visualMode === 'prominent-bare' && styles.sidebarMinimal,
                styles.sidebarWithProminentHeader,
                isExpanded ? styles.sidebarOpen : styles.sidebarClosed,
                hiddenCollapsed && styles.sidebarHiddenCollapsed,
                className
            )}
        >
            <ProminentSidebarHeader
                label={header.label}
                prominentHeader={header.prominentHeader}
                prominentHeaderLeft={header.prominentHeaderLeft}
                prominentHeaderRight={header.prominentHeaderRight}
                prominentHeaderButton={header.prominentHeaderButton}
                filterOpen={header.filterOpen}
                onFilterOpenChange={header.onFilterOpenChange}
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
                <div
                    className={cn(
                        visualMode === 'prominent' && styles.sidebarProminent
                    )}
                >
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
                <SidebarToggleFooter
                    isOpen={isExpanded}
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

export function SidebarHeaderButton({
    menu,
    onClick,
    icon = <IoMdOptions size={20} />,
    label = 'Show Filters',
    buttonVariant = 'icon',
    className,
}: SidebarHeaderButtonConfig): ReactElement {
    const shared = {
        type: 'button',
        buttonVariant,
        className,
        'aria-label': label,
        title: label,
    } as const

    if (!menu)
        return (
            <DropdownButton
                {...shared}
                aria-haspopup={undefined}
                aria-expanded={undefined}
                onClick={(event) => {
                    event.preventDefault()
                    onClick?.()
                }}
            >
                {icon}
            </DropdownButton>
        )

    return (
        <DropdownButton
            {...shared}
            icon={icon}
            onClick={onClick}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    body={
                        typeof menu === 'function'
                            ? menu({ close: closeDropdown })
                            : menu
                    }
                    onClose={closeDropdown}
                />
            )}
        />
    )
}

function resolveHeaderRight(
    custom: ReactNode,
    button: SidebarHeaderButtonConfig | undefined,
    filterOpen: boolean | undefined,
    onFilterOpenChange: ((open: boolean) => void) | undefined
): { element: ReactNode; isGenerated: boolean } {
    if (custom != null) return { element: custom, isGenerated: false }

    if (button) {
        const variant = button.buttonVariant ?? 'icon'
        return {
            element: <SidebarHeaderButton {...button} />,
            isGenerated: variant === 'icon' || variant === 'short',
        }
    }

    if (typeof filterOpen === 'boolean' && onFilterOpenChange)
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

    return { element: null, isGenerated: false }
}

interface ProminentSidebarHeaderProps {
    label?: string
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    prominentHeaderButton?: SidebarHeaderButtonConfig
    filterOpen?: boolean
    onFilterOpenChange?: (open: boolean) => void
    reserveToggleSpace: boolean
    largeTitle?: boolean
}

function ProminentSidebarHeader({
    label,
    prominentHeader,
    prominentHeaderLeft,
    prominentHeaderRight,
    prominentHeaderButton,
    filterOpen,
    onFilterOpenChange,
    reserveToggleSpace,
    largeTitle,
}: ProminentSidebarHeaderProps): ReactElement {
    if (prominentHeader) {
        return <>{prominentHeader}</>
    }

    const { element: resolvedHeaderRight, isGenerated } = resolveHeaderRight(
        prominentHeaderRight,
        prominentHeaderButton,
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

interface SidebarToggleFooterProps {
    isOpen: boolean
    hiddenCollapsed: boolean
    onToggle: () => void
}

function SidebarToggleFooter({
    isOpen,
    hiddenCollapsed,
    onToggle,
}: SidebarToggleFooterProps): ReactElement {
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
