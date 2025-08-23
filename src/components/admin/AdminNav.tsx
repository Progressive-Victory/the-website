'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    FaDonate,
    FaUserAstronaut,
    FaUsers,
    FaUserShield,
    FaUserTag,
} from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { IconType } from 'react-icons/lib'

const NAV_LINKS: {
    title: string
    href: string
    icon: IconType
    stats_key: string
}[] = [
    {
        title: 'Members',
        href: '/admin/members',
        icon: FaUsers,
        stats_key: 'users_count',
    },
    {
        title: 'Donors',
        href: '/admin/donors',
        icon: FaDonate,
        stats_key: 'donors_count',
    },
    {
        title: 'Positions',
        href: '/admin/positions',
        icon: FaClipboardUser,
        stats_key: 'positions_count',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: FaUserTag,
        stats_key: 'roles_count',
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
        icon: FaUserShield,
        stats_key: 'permissions_count',
    },
]

export default function AdminNav({ stats }: { stats: Record<string, number> }) {
    const pathname = usePathname()

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
                {open ? <>Volunteer Dashboard</> : null}
            </h1>

            <ul>
                {NAV_LINKS.map(({ href, title, icon: Icon, stats_key }) => {
                    const active = pathname === href

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
                            <Link href={href} title={title} className='flex gap-2 items-center'>
                                <Icon size={22} />
                                <span className="flex w-full items-center justify-between">
                                    <span>{title}</span>
                                    <span className="text-right text-sm">
                                        {stats[stats_key] ?? 0}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    )
                })}
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
