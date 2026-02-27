'use client'

import styles from './Sidebar.module.css'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FaUsers, FaUserShield, FaUserTag, FaDonate } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign } from 'react-icons/fa6'
import { FiChevronLeft } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'
import { useLocalStorage } from 'usehooks-ts'

interface SidebarProps {
    userCount?: number
    roleCount?: number
    permissionCount?: number
    donorCount?: number
    contributionCount?: number
}

interface NavItem {
    title: string
    href: string
    icon: IconType
    count?: number
}

export default function Sidebar({
    userCount,
    roleCount,
    permissionCount,
    donorCount,
    contributionCount,
}: SidebarProps) {
    const [open, setOpen] = useLocalStorage('pv.admin-nav-open', true)
    const pathname = usePathname()

    const items: NavItem[] = useMemo(
        () => [
            {
                title: 'Members',
                href: '/admin/panels/members',
                icon: FaUsers,
                count: userCount,
            },
            {
                title: 'Donors',
                href: '/admin/panels/donors',
                icon: FaDonate,
                count: donorCount,
            },
            {
                title: 'Contributions',
                href: '/admin/panels/contributions',
                icon: FaDollarSign,
                count: contributionCount,
            },
            {
                title: 'Positions',
                href: '/admin/panels/positions',
                icon: FaClipboardUser,
                count: 0,
            },
            {
                title: 'Roles',
                href: '/admin/panels/roles',
                icon: FaUserTag,
                count: roleCount,
            },
            {
                title: 'Permissions',
                href: '/admin/panels/permissions',
                icon: FaUserShield,
                count: permissionCount,
            },
            {
                title: 'Fundraising',
                href: '/admin/panels/fundraising',
                icon: FaDonate,
                count: 2,
            },
        ],
        [userCount, donorCount, contributionCount, roleCount, permissionCount]
    )

    const listRef = useRef<HTMLUListElement | null>(null)
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})
    const [indicatorY, setIndicatorY] = useState(0)
    const [indicatorH, setIndicatorH] = useState(0)
    const [hasIndicator, setHasIndicator] = useState(false)

    const activeHref = useMemo(() => {
        const exact = items.find((i) => i.href === pathname)?.href
        if (exact) return exact

        const nested = items.find((i) =>
            pathname?.startsWith(i.href + '/')
        )?.href
        return nested ?? null
    }, [items, pathname])

    useLayoutEffect(() => {
        const listEl = listRef.current
        if (!listEl || !activeHref) {
            setHasIndicator(false)
            return
        }

        const activeEl = itemRefs.current[activeHref]
        if (!activeEl) {
            setHasIndicator(false)
            return
        }

        const listRect = listEl.getBoundingClientRect()
        const itemRect = activeEl.getBoundingClientRect()

        setHasIndicator(true)
        setIndicatorY(itemRect.top - listRect.top)
        setIndicatorH(itemRect.height)
    }, [activeHref, open, items.length])

    return (
        <div
            className={classNames(styles.nav, {
                [styles.navOpen]: open,
                [styles.navClosed]: !open,
            })}
        >
            <h1 className={styles.heading}>
                {open ? 'Volunteer Dashboard' : null}
            </h1>

            <ul className={styles.list} ref={listRef}>
                <span
                    className={classNames(styles.activeIndicator, {
                        [styles.activeIndicatorHidden]: !hasIndicator,
                    })}
                    style={{
                        transform: `translateY(${indicatorY}px)`,
                        height: indicatorH ? `${indicatorH}px` : undefined,
                    }}
                    aria-hidden="true"
                />

                {items.map((item) => (
                    <NavLink
                        key={item.href}
                        title={item.title}
                        href={item.href}
                        icon={item.icon}
                        count={item.count}
                        open={open}
                        active={activeHref === item.href}
                        setRef={(el) => {
                            itemRefs.current[item.href] = el
                        }}
                    />
                ))}
            </ul>

            <button
                className={styles.toggleButton}
                onClick={() => setOpen(!open)}
                title={open ? 'Collapse' : 'Expand'}
                type="button"
            >
                <FiChevronLeft
                    size={20}
                    className={classNames(styles.toggleIcon, {
                        [styles.toggleIconClosed]: !open,
                    })}
                />
            </button>
        </div>
    )
}

interface NavLinkProps {
    title: string
    href: string
    icon: IconType
    count?: number
    open?: boolean
    active?: boolean
    setRef?: (el: HTMLLIElement | null) => void
}

function NavLink({
    title,
    href,
    icon: Icon,
    count,
    open,
    active,
    setRef,
}: NavLinkProps) {
    const formattedCount = (count ?? 0).toLocaleString()

    return (
        <li
            ref={setRef}
            className={classNames(styles.item, {
                [styles.itemActive]: active,
                [styles.itemInactive]: !active,
            })}
        >
            <Link href={href} title={title} className={styles.link}>
                <Icon size={22} />

                {open ? (
                    <span className={styles.linkRow}>
                        <span className={styles.title}>{title}</span>
                        {typeof count === 'number' ? (
                            <span className={styles.count}>
                                {formattedCount}
                            </span>
                        ) : null}
                    </span>
                ) : null}
            </Link>
        </li>
    )
}
