'use client'

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
            className={classNames(
                'relative flex flex-col gap-2 overflow-y-auto bg-white p-4',
                {
                    'min-w-[12rem] 2xl:min-w-[15rem]': open,
                    'min-w-14': !open,
                }
            )}
        >
            <h1 className="text-lg font-semibold text-black-pearl-dark">
                {open ? 'Volunteer Dashboard' : null}
            </h1>

            <ul>
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
                className="absolute bottom-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
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
    const active = usePathname() === href

    return (
        <li
            key={href}
            className={classNames(
                'relative cursor-pointer py-1 hover:text-sky-600',
                {
                    'font-bold text-sky-500 after:absolute after:-right-4 after:top-0 after:h-full after:w-1 after:rounded-l-lg after:bg-sky-500':
                        active,
                    'font-medium': !active,
                }
            )}
        >
            <Link href={href} title={title} className="flex items-center gap-2">
                <Icon size={22} />
                {open ? (
                    <span className="flex w-full items-center justify-between">
                        <span>{title}</span>
                        <span className="text-right text-sm">{count ?? 0}</span>
                    </span>
                ) : null}
            </Link>
        </li>
    )
}
