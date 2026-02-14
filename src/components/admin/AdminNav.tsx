'use client'

import styles from './AdminNav.module.css'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaDonate, FaUsers, FaUserShield, FaUserTag } from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'
import { FiChevronLeft } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'
import { useLocalStorage } from 'usehooks-ts'

interface AdminNavProps {
    userCount?: number
    roleCount?: number
    permissionCount?: number
    donorCount?: number
}

export default function AdminNav({
    userCount,
    roleCount,
    permissionCount,
    donorCount,
}: AdminNavProps) {
    const [open, setOpen] = useLocalStorage('pv.admin-nav-open', true)

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

            <ul className={styles.list}>
                <NavLink
                    title="Members"
                    href="/admin/members"
                    icon={FaUsers}
                    count={userCount}
                    open={open}
                />
                <NavLink
                    title="Donors"
                    href="/admin/donors"
                    icon={FaDonate}
                    count={donorCount}
                    open={open}
                />
                <NavLink
                    title="Positions"
                    href="/admin/positions"
                    icon={FaClipboardUser}
                    open={open}
                />
                <NavLink
                    title="Roles"
                    href="/admin/roles"
                    icon={FaUserTag}
                    count={roleCount}
                    open={open}
                />
                <NavLink
                    title="Permissions"
                    href="/admin/permissions"
                    icon={FaUserShield}
                    count={permissionCount}
                    open={open}
                />
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
}

function NavLink({ title, href, icon: Icon, count, open }: NavLinkProps) {
    const pathname = usePathname()
    const active = pathname === href

    const formattedCount = (count ?? 0).toLocaleString()

    return (
        <li
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
                        <span className={styles.count}>{formattedCount}</span>
                    </span>
                ) : null}
            </Link>
        </li>
    )
}
