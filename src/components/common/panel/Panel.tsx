import styles from './Panel.module.css'
import type { ReactNode } from 'react'

export interface PanelProps {
    children: ReactNode
    label?: string
    includeHeader?: boolean
    headerLead?: ReactNode
}

export function Panel({
    children,
    label,
    includeHeader = false,
    headerLead,
}: PanelProps) {
    const panelLabel = label ?? 'Panel'

    return (
        <div className={styles.content} aria-label={panelLabel}>
            {includeHeader ? (
                <div className={styles.panelHeader}>
                    <div className={styles.panelHeaderLeft}>
                        {headerLead}
                        <div className={styles.breadcrumbs}>
                            <span className={styles.prominentBreadcrumb}>
                                Admin
                            </span>
                            <span className={styles.breadcrumbSeperator}>
                                /
                            </span>
                            <span className={styles.panelBreadcrumb}>
                                {panelLabel}
                            </span>
                        </div>
                    </div>

                    <div className={styles.panelTimestamp}>
                        Last Updated: N/A
                    </div>
                </div>
            ) : null}
            {children}
        </div>
    )
}

export default Panel
