'use client'

import { ListRowLabel, type ListRowLabelProps } from './ListRow'
import rowStyles from './ListRow.module.css'
import styles from './NavigationRow.module.css'
import { cn } from '@/util'
import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'
import { FiChevronRight } from 'react-icons/fi'

export interface NavigationRowProps extends Omit<ListRowLabelProps, 'id'> {
    value?: ReactNode
    href?: string
    onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
}

export function NavigationRow({
    label,
    value,
    indicator,
    labelAlign,
    href,
    onClick,
    className,
}: NavigationRowProps) {
    const content = (
        <>
            <ListRowLabel
                label={label}
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
