import styles from './Panel.module.css'
import {
    NavigationStack,
    SidebarToggleButton,
} from '@/components/common/navigation_stack/NavigationStack'
import {
    Detail,
    PanelBackButton,
} from '@/components/common/navigation_stack/detail/Detail'
import { Sidebar } from '@/components/common/navigation_stack/sidebar/Sidebar'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export interface PanelProps {
    children: ReactNode
    label?: string
    includeHeader?: boolean
    includeSidebar?: boolean
    sidebarWidth?: string
    sidebarClassName?: string
    sidebarBody?: ReactNode
    sidebarMobileVisible?: boolean
    sidebarFilterOpen?: boolean
    onSidebarFilterOpenChange?: (open: boolean) => void
    collapsedSidebarMode?: 'compact' | 'hidden'
    prominentHeader?: ReactNode
    prominentHeaderLeft?: ReactNode
    prominentHeaderRight?: ReactNode
    headerLead?: ReactNode
    headerLeft?: ReactNode
    headerRight?: ReactNode
}

export function Panel({
    children,
    label,
    includeHeader = false,
    includeSidebar = false,
    sidebarWidth,
    sidebarClassName,
    sidebarBody,
    sidebarMobileVisible,
    sidebarFilterOpen,
    onSidebarFilterOpenChange,
    collapsedSidebarMode = 'hidden',
    prominentHeader,
    prominentHeaderLeft,
    prominentHeaderRight,
    headerLead,
    headerLeft,
    headerRight,
}: PanelProps) {
    const panelLabel = label ?? 'Panel'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const showHeader = includeHeader
    const showOverlaySidebarToggle =
        includeSidebar && collapsedSidebarMode === 'hidden' && isDesktop
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
                                size={18}
                            />
                        ) : null
                    }
                    sidebar={
                        <Sidebar
                            label={panelLabel}
                            includeHeader={includeHeader}
                            sidebarWidth={sidebarWidth}
                            className={sidebarClassName}
                            filterOpen={sidebarFilterOpen}
                            onFilterOpenChange={onSidebarFilterOpenChange}
                            sidebarStyle="prominent"
                            collapsedSidebarMode={collapsedSidebarMode}
                            mobileVisible={sidebarMobileVisible}
                            open={isSidebarOpen}
                            onOpenChange={setIsSidebarOpen}
                            prominentHeader={prominentHeader}
                            prominentHeaderLeft={resolvedProminentHeaderLeft}
                            prominentHeaderRight={prominentHeaderRight}
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
