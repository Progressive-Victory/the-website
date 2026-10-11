'use client'

import styles from './SelectionIndicator.module.css'
import type { IndicatorStyle } from './hooks'
import type { ReactElement } from 'react'

interface SelectionIndicatorProps {
    layoutSyncing: boolean
    style: IndicatorStyle
}

export function SelectionIndicator({
    layoutSyncing,
    style,
}: SelectionIndicatorProps): ReactElement {
    return (
        <div
            aria-hidden="true"
            className={styles.selectionIndicator}
            data-layout-syncing={layoutSyncing}
            data-visible={style.visible}
            style={{
                top: `${style.top}px`,
                height: `${style.height}px`,
            }}
        />
    )
}
