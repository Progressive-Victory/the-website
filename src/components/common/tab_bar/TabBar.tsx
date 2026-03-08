'use client'

import styles from './TabBar.module.css'
import cx from 'classnames'
import { useMemo } from 'react'

export interface TabSpec {
    key: string
    label: string
    disabled?: boolean
}

export interface TabBarProps {
    tabs: TabSpec[]
    value: string
    onChange: (key: string) => void

    className?: string
    ariaLabel?: string
}

export function TabBar({
    tabs,
    value,
    onChange,
    className,
    ariaLabel = 'Tabs',
}: TabBarProps) {
    if (!tabs?.length) throw Error('TabBar requires at least 1 tab')

    const selectedIndex = useMemo(() => {
        const idx = tabs.findIndex((t) => t.key === value)
        return Math.max(0, idx)
    }, [tabs, value])

    const resolvedValue = tabs[selectedIndex]?.key ?? tabs[0].key

    return (
        <div
            className={styles.tabBar}
            role="tablist"
            aria-label={ariaLabel}
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
                const active = tab.key === resolvedValue
                const disabled = !!tab.disabled

                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-disabled={disabled}
                        disabled={disabled}
                        className={cx(styles.tabButton, {
                            [styles.tabButtonActive]: active,
                            [styles.tabButtonDisabled]: disabled,
                        })}
                        onClick={() => !disabled && onChange(tab.key)}
                    >
                        <span className={styles.tabButtonLabel}>
                            {tab.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
