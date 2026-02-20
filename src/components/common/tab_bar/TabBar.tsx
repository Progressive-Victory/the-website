'use client'

import { ITabPane } from './Tab'
import styles from './TabBar.module.css'
import cx from 'classnames'
import { useMemo, useState } from 'react'

export interface TabPanelProps {
    children?: ITabPane[]
}

export function TabPanel({ children = [] }: TabPanelProps) {
    if (!children?.[0]?.key)
        throw Error('Tab panels must have children with keys')

    const tabs = useMemo(() => {
        return children.map((child) => {
            if (!child.key) throw Error('All tabs must have keys')
            return {
                key: String(child.key),
                label: child.props.label,
                pane: child,
            }
        })
    }, [children])

    const [selectedTab, setSelectedTab] = useState<string>(tabs[0].key)

    const selectedIndex = Math.max(
        0,
        tabs.findIndex((t) => t.key === selectedTab)
    )

    const pane = tabs[selectedIndex]?.pane ?? null

    return (
        <div>
            <div className={styles.panel}>
                <div
                    className={styles.tabBar}
                    role="tablist"
                    aria-label="Tabs"
                    style={
                        {
                            '--tab-count': tabs.length,
                            '--tab-index': selectedIndex,
                        } as React.CSSProperties & Record<string, number>
                    }
                >
                    <div className={styles.track} aria-hidden="true">
                        <div className={styles.thumb} />
                    </div>

                    {tabs.map((tab) => {
                        const active = tab.key === selectedTab

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                className={cx(styles.tabButton, {
                                    [styles.tabButtonActive]: active,
                                })}
                                onClick={() => setSelectedTab(tab.key)}
                            >
                                <span className={styles.tabButtonLabel}>
                                    {tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className={styles.pane} role="tabpanel">
                {pane}
            </div>
        </div>
    )
}
