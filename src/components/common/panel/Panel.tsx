import styles from './Panel.module.css'
import {
    SidebarListFilters,
    type SidebarListFiltersConfig,
} from './sidebar_list/SidebarList'
import {
    SidebarListFooter,
    type SidebarListFooterProps,
} from './sidebar_list/SidebarList'
import {
    SidebarListSearch,
    type SidebarListSearchProps,
} from './sidebar_list/SidebarList'
import {
    NavigationStack,
    SidebarToggleButton,
} from '@/components/common/navigation_stack'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { PanelBackButton } from '@/components/common/navigation_stack/detail/PanelBackButton'
import { Sidebar } from '@/components/common/navigation_stack/sidebar/Sidebar'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export interface SidebarListConfig {
    search?: SidebarListSearchProps
    filters?: SidebarListFiltersConfig
    footer?: SidebarListFooterProps
}

export interface PanelProps {
    children: ReactNode
    label?: string
    includeHeader?: boolean
    includeSidebar?: boolean
    largeTitle?: boolean
    sidebarList?: SidebarListConfig
    sidebarSearch?: ReactNode
    sidebarFooter?: ReactNode
    hideSidebarFooterWhenCollapsed?: boolean
    keepSidebarBorderWhenCollapsed?: boolean
    sidebarWidth?: string
    collapsedSidebarWidth?: string
    showScrollbar?: boolean
    sidebarClassName?: string
    sidebarBody?: ReactNode
    sidebarMobileVisible?: boolean
    sidebarFilterOpen?: boolean
    onSidebarFilterOpenChange?: (open: boolean) => void
    sidebarFilterContent?: ReactNode
    collapsedSidebarMode?: 'compact' | 'hidden'
    sidebarTogglePlacement?: 'header' | 'footer'
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    headerLead?: ReactNode
    headerLeft?: ReactNode
    headerRight?: ReactNode
    footer?: ReactNode
}

export function Panel({
    children,
    label,
    includeHeader = false,
    includeSidebar = false,
    largeTitle = false,
    sidebarList,
    sidebarSearch,
    sidebarFooter,
    hideSidebarFooterWhenCollapsed = false,
    keepSidebarBorderWhenCollapsed = false,
    sidebarWidth,
    collapsedSidebarWidth,
    showScrollbar = true,
    sidebarClassName,
    sidebarBody,
    sidebarMobileVisible,
    sidebarFilterOpen,
    onSidebarFilterOpenChange,
    sidebarFilterContent,
    collapsedSidebarMode = 'hidden',
    sidebarTogglePlacement,
    prominentHeader,
    prominentHeaderLeft,
    prominentHeaderRight,
    headerLead,
    headerLeft,
    headerRight,
    footer,
}: PanelProps) {
    const panelLabel = label ?? 'Panel'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const showHeader = includeHeader
    const resolvedSidebarTogglePlacement =
        sidebarTogglePlacement ??
        (collapsedSidebarMode === 'hidden' ? 'header' : 'footer')
    const showOverlaySidebarToggle =
        includeSidebar &&
        resolvedSidebarTogglePlacement === 'header' &&
        isDesktop
    const shiftHeaderLeftForToggle = showOverlaySidebarToggle && !isSidebarOpen
    const resolvedHeaderLead =
        headerLead ??
        (includeSidebar ? (
            isDesktop ? (
                <PanelBackButton showOnDesktop />
            ) : null
        ) : (
            <PanelBackButton />
        ))
    const resolvedProminentHeaderLeft =
        prominentHeaderLeft ??
        (includeSidebar && !isDesktop ? <PanelBackButton /> : undefined)
    const resolvedSidebarFooter =
        sidebarFooter ??
        (sidebarList?.footer ? (
            <SidebarListFooter {...sidebarList.footer} />
        ) : null)
    const resolvedSidebarSearch =
        sidebarSearch ??
        (sidebarList?.search ? (
            <SidebarListSearch {...sidebarList.search} />
        ) : null)
    const resolvedSidebarFilterContent =
        sidebarFilterContent ??
        (sidebarList?.filters ? (
            <SidebarListFilters {...sidebarList.filters} />
        ) : undefined)

    return (
        <div className={styles.content} aria-label={panelLabel}>
            {includeSidebar ? (
                <NavigationStack
                    overlay={
                        showOverlaySidebarToggle ? (
                            <SidebarToggleButton
                                isOpen={isSidebarOpen}
                                onToggle={() =>
                                    setIsSidebarOpen((previous) => !previous)
                                }
                            />
                        ) : null
                    }
                    sidebar={
                        <Sidebar
                            className={sidebarClassName}
                            variant="prominent"
                            width={sidebarWidth}
                            collapsedWidth={collapsedSidebarWidth}
                            collapsedMode={collapsedSidebarMode}
                            mobileVisible={sidebarMobileVisible}
                            showScrollbar={showScrollbar}
                            open={isSidebarOpen}
                            onOpenChange={setIsSidebarOpen}
                            showFooterToggle={
                                resolvedSidebarTogglePlacement === 'footer'
                            }
                            hideFooterWhenCollapsed={
                                hideSidebarFooterWhenCollapsed
                            }
                            keepBorderWhenCollapsed={
                                keepSidebarBorderWhenCollapsed
                            }
                            reserveHeaderToggleSpace={
                                resolvedSidebarTogglePlacement === 'header'
                            }
                            label={panelLabel}
                            header={{
                                mode: includeHeader ? 'shown' : 'hidden',
                                label: panelLabel,
                                largeTitle,
                                search: resolvedSidebarSearch,
                                filters: resolvedSidebarFilterContent
                                    ? {
                                          open: sidebarFilterOpen,
                                          onOpenChange:
                                              onSidebarFilterOpenChange,
                                          content: resolvedSidebarFilterContent,
                                      }
                                    : undefined,
                                content: prominentHeader,
                                left: resolvedProminentHeaderLeft,
                                right: prominentHeaderRight,
                            }}
                            footer={resolvedSidebarFooter}
                        >
                            {sidebarBody}
                        </Sidebar>
                    }
                    detail={
                        <Detail
                            bodyType="panel"
                            label={panelLabel}
                            body={
                                <>
                                    {showHeader ? (
                                        <PanelHeader
                                            panelLabel={panelLabel}
                                            shiftForOverlayToggle={
                                                shiftHeaderLeftForToggle
                                            }
                                            headerLead={resolvedHeaderLead}
                                            headerLeft={headerLeft}
                                            headerRight={headerRight}
                                        />
                                    ) : null}
                                    {children}
                                    {footer ? (
                                        <PanelFooter>{footer}</PanelFooter>
                                    ) : null}
                                </>
                            }
                        />
                    }
                />
            ) : null}
            {!includeSidebar ? (
                <>
                    {showHeader ? (
                        <PanelHeader
                            panelLabel={panelLabel}
                            shiftForOverlayToggle={false}
                            headerLead={resolvedHeaderLead}
                            headerLeft={headerLeft}
                            headerRight={headerRight}
                        />
                    ) : null}
                    {children}
                    {footer ? <PanelFooter>{footer}</PanelFooter> : null}
                </>
            ) : null}
        </div>
    )
}

export default Panel

interface PanelHeaderProps {
    panelLabel: string
    shiftForOverlayToggle?: boolean
    headerLead?: ReactNode
    headerLeft?: ReactNode
    headerRight?: ReactNode
}

function PanelHeader({
    panelLabel,
    shiftForOverlayToggle = false,
    headerLead,
    headerLeft,
    headerRight,
}: PanelHeaderProps): ReactNode {
    return (
        <div className={styles.panelHeader}>
            <div
                className={[
                    styles.panelHeaderLeft,
                    shiftForOverlayToggle ? styles.panelHeaderLeftShifted : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {headerLead}
                {headerLeft ?? (
                    <div className={styles.breadcrumbs}>
                        <span className={styles.prominentBreadcrumb}>
                            Admin
                        </span>
                        <span className={styles.breadcrumbSeperator}>/</span>
                        <span className={styles.panelBreadcrumb}>
                            {panelLabel}
                        </span>
                    </div>
                )}
            </div>
            <div className={styles.panelHeaderRight}>
                {headerRight ?? (
                    <div className={styles.panelTimestamp}>
                        Last Updated: N/A
                    </div>
                )}
            </div>
        </div>
    )
}

interface PanelFooterProps {
    children?: ReactNode
}

function PanelFooter({ children }: PanelFooterProps): ReactNode {
    return <div className={styles.panelFooter}>{children}</div>
}
