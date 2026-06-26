'use client'

/*
 * Nav.Account — SKELETON.
 *
 * Avatar/account row (replaces NavigationButton buttonType="account" +
 * SidebarFeatured). Caller supplies the avatar node; this isolates the account
 * presentation from generic nav rows.
 */

import styles from './nav.module.css'
import Link from 'next/link'
import type { ReactElement, ReactNode } from 'react'

export interface NavAccountProps {
    href: string
    avatar: ReactNode
    name: string
    subtitle?: string
    onClick?: () => void
}

export function NavAccount({
    href,
    avatar,
    name,
    subtitle,
    onClick,
}: NavAccountProps): ReactElement {
    return (
        <Link
            href={href}
            className={styles.account}
            data-part="account"
            onClick={onClick}
        >
            {avatar}
            <span className={styles.accountText}>
                <span className={styles.label}>{name}</span>
                {subtitle ? (
                    <span className={styles.subtitle}>{subtitle}</span>
                ) : null}
            </span>
        </Link>
    )
}
