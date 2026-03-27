'use client'

import OrgChartApp from './app'
import styles from './page.module.css'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'

export interface PaginatedResponse<T> {
    //This is just a test.
    data: T[]
}

export default function OrgChart() {
    return (
        <MainLayout>
            <HalftoneBackground />
            <div className={styles.backdrop} />
            <div className={styles.container}>
                <header className={styles.header}>
                    {'Organization '}
                    <span style={{ color: '#09223a' }}>{'Chart'}</span>
                </header>
                <div className={styles.appContainer}>
                    <OrgChartApp />
                </div>
            </div>
        </MainLayout>
    )
}
