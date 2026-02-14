'use client'

import styles from './AdminNav.module.css'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaDonate, FaUsers, FaUserShield, FaUserTag } from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { IconType } from 'react-icons/lib'
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
                [styles.open]: open,
                [styles.closed]: !open,
            })}
        >
            <h1 className={styles.title}>
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
            >
                {open ? (
                    <FiChevronLeft size={20} />
                ) : (
                    <FiChevronRight size={20} />
                )}
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

    return (
        <li
            className={classNames(styles.navItem, {
                [styles.active]: active,
                [styles.inactive]: !active,
            })}
        >
            <Link href={href} title={title} className={styles.navLink}>
                <Icon size={22} />

                {open ? (
                    <span className={styles.labelRow}>
                        <span className={styles.label}>{title}</span>
                        <span className={styles.count}>{count ?? 0}</span>
                    </span>
                ) : null}
            </Link>
        </li>
    )
}
