import styles from './Table.module.css'
import { cn } from '@/util'

const BAR_WIDTHS = ['70%', '55%', '85%', '40%', '65%', '50%', '75%']

interface TableSkeletonProps {
    columns?: number
    rows?: number
    label?: string
}

export function TableSkeleton({
    columns = 8,
    rows = 12,
    label = 'Loading',
}: TableSkeletonProps) {
    const gridTemplateColumns = `repeat(${columns}, minmax(6rem, 1fr))`
    const columnIndexes = Array.from({ length: columns }, (_, index) => index)

    return (
        <div
            className={styles.container}
            role="status"
            aria-busy="true"
            aria-label={label}
        >
            <div className={styles.header} style={{ gridTemplateColumns }}>
                {columnIndexes.map((column) => (
                    <span
                        key={column}
                        className={cn(styles.skeletonBar, styles.skeletonHeader)}
                        style={{ width: BAR_WIDTHS[column % BAR_WIDTHS.length] }}
                    />
                ))}
            </div>
            {Array.from({ length: rows }, (_, row) => (
                <div
                    key={row}
                    className={styles.row}
                    style={{ gridTemplateColumns }}
                >
                    {columnIndexes.map((column) => (
                        <span
                            key={column}
                            className={styles.skeletonBar}
                            style={{
                                width: BAR_WIDTHS[
                                    (row + column * 3) % BAR_WIDTHS.length
                                ],
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
