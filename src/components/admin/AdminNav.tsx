'use client'

import classNames from 'classnames'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FaKey, FaUsers, FaUserShield, FaUserTag } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { IconType } from 'react-icons/lib'

const NAV_LINKS: { title: string; href: string; icon: IconType }[] = [
    {
        title: 'Members',
        href: '/admin/members',
        icon: FaUsers,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: FaUserTag,
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
        icon: FaUserShield,
    },
]

export default function AdminNav() {
    const pathname = usePathname()

    const [open, setOpen] = useState(true)

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
                {open ? <>Admin Portal</> : null}
            </h1>

            <ul>
                {NAV_LINKS.map(({ href, title, icon: Icon }) => {
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
                            <a href={href} title={title}>
                                {open ? title : <Icon size={24} />}
                            </a>
                        </li>
                    )
                })}
            </ul>

            <button
                className="absolute bottom-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
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
