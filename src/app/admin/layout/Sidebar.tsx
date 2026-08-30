'use client'

import styles from './Sidebar.module.css'
import { cn } from '@/util'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaUsers, FaUserShield, FaUserTag, FaDonate } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign, FaCalendarDays } from 'react-icons/fa6'
import { FiChevronLeft } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'
import { useLocalStorage } from 'usehooks-ts'

interface SidebarProps {
    userCount?: number
    donorCount?: number
    contributionCount?: number
    positionCount?: number
    roleCount?: number
    permissionCount?: number
    eventCount?: number
}

export default function Sidebar({
    userCount,
    donorCount,
    contributionCount,
    positionCount,
    roleCount,
    permissionCount,
    eventCount,
}: SidebarProps) {
    const [open, setOpen] = useLocalStorage('pv.admin-nav-open', true)

    return (
        <div
            className={cn(styles.nav, open ? styles.navOpen : styles.navClosed)}
        >
            <h1 className={styles.heading}>
                {open ? 'Volunteer Dashboard' : null}
            </h1>

            <ul className={styles.list}>
                <NavLink
                    title="Members"
                    href="/admin/panels/members"
                    icon={FaUsers}
                    count={userCount}
                    open={open}
                />
                <NavLink
                    title="Donors"
                    href="/admin/panels/donors"
                    icon={FaDonate}
                    count={donorCount}
                    open={open}
                />

                <NavLink
                    title="Contributions"
                    href="/admin/panels/contributions"
                    icon={FaDollarSign}
                    count={contributionCount}
                    open={open}
                />

                <NavLink
                    title="Positions"
                    href="/admin/panels/positions"
                    icon={FaClipboardUser}
                    count={positionCount}
                    open={open}
                />

                <NavLink
                    title="Roles"
                    href="/admin/panels/roles"
                    icon={FaUserTag}
                    count={roleCount}
                    open={open}
                />

                <NavLink
                    title="Permissions"
                    href="/admin/panels/permissions"
                    icon={FaUserShield}
                    count={permissionCount}
                    open={open}
                />

                <NavLink
                    title="Fundraising"
                    href="/admin/panels/fundraising"
                    icon={FaDonate}
                    count={2}
                    open={open}
                />

                <NavLink
                    title="Events"
                    href="/admin/panels/events"
                    icon={FaCalendarDays}
                    count={eventCount}
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
                    className={cn(
                        styles.toggleIcon,
                        !open && styles.toggleIconClosed
                    )}
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
            className={cn(
                styles.item,
                active ? styles.itemActive : styles.itemInactive
            )}
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
