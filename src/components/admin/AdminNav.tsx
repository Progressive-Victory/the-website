'use client'

import classNames from 'classnames'

const NAV_LINKS = [
    {
        title: 'Members',
        href: '/admin/members',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
    {
        title: 'Permissions',
        href: '/admin/permission',
    },
]

export default function AdminNav() {
    return (
        <div className="flex flex-col gap-2 overflow-y-auto bg-white p-4">
            <h1 className="text-lg font-semibold text-black-pearl-dark">
                Admin Portal
            </h1>

            <ul>
                {NAV_LINKS.map((link) => {
                    const active = location.pathname === link.href

                    return (
                        <li
                            key={link.href}
                            className={classNames(
                                'relative cursor-pointer py-1 hover:text-sky-600',
                                {
                                    'font-bold text-sky-500 after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-sky-500':
                                        active,
                                    'font-medium': !active,
                                }
                            )}
                        >
                            <a href={link.href}>{link.title}</a>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
