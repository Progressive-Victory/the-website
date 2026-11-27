import styles from '../page.module.css'
import skeleton from '@/components/common/Skeleton.module.css'
import { cn } from '@/util'

function SkeletonCard() {
    return (
        <div className={styles.loadingCard}>
            <span className={cn(skeleton.bar, styles.loadingTitle)} />
            <span className={cn(skeleton.bar, styles.loadingSeat)} />
        </div>
    )
}

export function ChartLoading() {
    return (
        <div className={styles.chartLoading}>
            <div className={styles.loadingTree} aria-hidden="true">
                <SkeletonCard />
                <div className={styles.loadingConnector} />
                <div className={styles.loadingRow}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
            <div className={styles.loadingPill} role="status">
                <span className={styles.loadingSpinner} aria-hidden="true" />
                Loading chart…
            </div>
        </div>
    )
}
