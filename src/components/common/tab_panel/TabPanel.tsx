'use client'

import { ITabPane } from './TabPane'
import style from './tabPanel.module.css'
import { useState } from 'react'

export interface TabPanelProps {
    children?: ITabPane[]
}

export function TabPanel({ children = [] }: TabPanelProps) {
    if (!children?.[0].key)
        throw Error('Tab panels must have children with keys')
    const [selectedTab, setSelectedTab] = useState<string>(children?.[0].key)

    const renderPane = () => {
        return children.find((x) => x.key == selectedTab)
    }

    const renderTab = (tab: ITabPane) => {
        if (!tab.key) throw Error('All tabs must have keys')
        return (
            <button
                className={`${style.tabButton}${tab.key == selectedTab ? ` ${style.tabButtonSelected}` : ''}`}
                key={tab.key}
                onClick={() => setSelectedTab(tab.key ?? '')}
            >
                {tab.props.label}
            </button>
        )
    }

    return (
        <div>
            <div className={style.tabBar}>
                {children.map((child) => renderTab(child))}
            </div>
            {renderPane()}
        </div>
    )
}
