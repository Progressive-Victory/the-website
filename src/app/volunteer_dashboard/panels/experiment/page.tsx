'use client'

import styles from './page.module.css'
import Panel from '@/components/common/panel/Panel'

export default function Page() {
    return (
        <Panel includeHeader label="Experiment">
            <div className={styles.panelContents}>
                <div className={styles.scrollView}>
                    <div className={styles.galleryHeader}>
                        <div className={styles.galleryHeading}>
                            <h1 className={styles.galleryTitle}>Experiment</h1>
                            <p className={styles.gallerySubTitle}>
                                Sandbox for iterating on the Table component.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    )
}
