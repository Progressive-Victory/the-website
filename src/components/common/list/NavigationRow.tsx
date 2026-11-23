'use client'

import { useListLoading } from './ListContext'
import {
    ListRowLabel,
    ListRowSkeletonBar,
    type ListRowLabelProps,
} from './ListRow'
import rowStyles from './ListRow.module.css'
import styles from './NavigationRow.module.css'
import { cn } from '@/util'
import Link from 'next/link'
import { useId, type MouseEventHandler, type ReactNode } from 'react'
import { FiChevronRight } from 'react-icons/fi'

export interface NavigationRowProps extends Omit<ListRowLabelProps, 'id'> {
    value?: ReactNode
    href?: string
    onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
}

export function NavigationRow({
    label,
    sublabel,
    value,
    indicator,
    labelAlign,
    href,
    onClick,
    className,
}: NavigationRowProps) {
    const seed = useId()
    const loading = useListLoading()

    if (loading)
        return (
            <div className={cn(rowStyles.row, className)}>
                <ListRowLabel label={<ListRowSkeletonBar seed={seed} />} />
            </div>
        )

    const content = (
        <>
            <ListRowLabel
                label={label}
                sublabel={sublabel}
                indicator={indicator}
                labelAlign={labelAlign}
                className={styles.label}
            />
            {value != null && value !== '' && (
                <span className={styles.value}>{value}</span>
            )}
            <FiChevronRight aria-hidden="true" className={styles.chevron} />
        </>
    )
    const rowClassName = cn(rowStyles.row, styles.navigation, className)

    return href ? (
        <Link href={href} onClick={onClick} className={rowClassName}>
            {content}
        </Link>
    ) : (
        <button type="button" onClick={onClick} className={rowClassName}>
            {content}
        </button>
    )
}
