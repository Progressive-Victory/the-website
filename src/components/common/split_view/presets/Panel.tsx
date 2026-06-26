'use client'

/*
 * Panel — SKELETON preset (replaces the old Panel).
 *
 * High-level convenience wrapper. This is the ONLY layer where boolean
 * convenience props live; it translates them into the correct primitive
 * composition. A panel that needs something bespoke can drop down to the
 * primitives directly instead of growing this prop surface.
 *
 * TODO(impl): map props -> Sidebar/Detail parts; mobile/back-button defaults.
 */
import { SplitView } from '../SplitView'
import { Detail } from '../detail/Detail'
import { Sidebar } from '../sidebar/Sidebar'
import type { ReactNode } from 'react'

export interface PanelProps {
    label?: string
    includeSidebar?: boolean
    includeHeader?: boolean
    largeTitle?: boolean
    sidebarVariant?: 'minimal' | 'prominent'
    sidebarFeatured?: ReactNode
    sidebarBody?: ReactNode
    sidebarSearch?: ReactNode
    sidebarFilters?: ReactNode
    sidebarFooter?: ReactNode
    headerLeft?: ReactNode
    headerRight?: ReactNode
    footer?: ReactNode
    children?: ReactNode
}

export function Panel({
    label = 'Panel',
    includeSidebar = false,
    includeHeader = false,
    largeTitle = false,
    sidebarVariant = 'prominent',
    sidebarFeatured,
    sidebarBody,
    sidebarSearch,
    sidebarFilters,
    sidebarFooter,
    headerLeft,
    headerRight,
    footer,
    children,
}: PanelProps) {
    return (
        <SplitView selected>
            {includeSidebar ? (
                <SplitView.Sidebar>
                    <Sidebar
                        variant={sidebarVariant}
                        selectionIndicator
                        largeTitle={largeTitle}
                    >
                        {includeHeader ? (
                            <Sidebar.Header>
                                {headerLeft ? (
                                    <Sidebar.Actions slot="left">
                                        {headerLeft}
                                    </Sidebar.Actions>
                                ) : null}
                                <Sidebar.Title large={largeTitle}>
                                    {label}
                                </Sidebar.Title>
                                {sidebarSearch ? (
                                    <Sidebar.Search>
                                        {sidebarSearch}
                                    </Sidebar.Search>
                                ) : null}
                                <Sidebar.Actions slot="right">
                                    {sidebarFilters ? (
                                        <Sidebar.FilterButton>
                                            {sidebarFilters}
                                        </Sidebar.FilterButton>
                                    ) : null}
                                    {headerRight}
                                </Sidebar.Actions>
                            </Sidebar.Header>
                        ) : null}

                        {sidebarFeatured ? (
                            <Sidebar.Featured>
                                {sidebarFeatured}
                            </Sidebar.Featured>
                        ) : null}

                        <Sidebar.List selectionIndicator>
                            {sidebarBody}
                        </Sidebar.List>

                        {sidebarFooter ? (
                            <Sidebar.Footer>{sidebarFooter}</Sidebar.Footer>
                        ) : null}
                    </Sidebar>
                </SplitView.Sidebar>
            ) : null}

            <SplitView.Detail>
                <Detail>
                    {includeHeader ? (
                        <Detail.Header>
                            <Detail.BackButton />
                        </Detail.Header>
                    ) : null}
                    <Detail.Body>{children}</Detail.Body>
                    {footer ? <Detail.Footer>{footer}</Detail.Footer> : null}
                </Detail>
            </SplitView.Detail>
        </SplitView>
    )
}
