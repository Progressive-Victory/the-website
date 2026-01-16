'use client'

import { MainLayout } from '@/components/layout'
import { hasPermission, useCurrentUser } from '@/util/hooks'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useMemo } from 'react'

export function Account() {
    const { data: session } = useSession()
    const user = useCurrentUser()

    console.log(user)

    const AdminPanelButton = useMemo(() => {
        if (user.data) {
            if (hasPermission(user.data, 'Admin Panel Access')) {
                return (
                    <Link href="/admin">
                        <button className="rounded-full bg-valencia px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-white hover:text-black-pearl-dark">
                            Admin Panel
                        </button>
                    </Link>
                )
            }
        }

        return undefined
    }, [user.data])

    if (!session) return null

    return (
        <MainLayout>
            <div className="relative flex size-full min-h-screen flex-1 flex-col items-center bg-steel-blue xl:min-h-[unset]">
                <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />

                <div className="z-2 relative mt-20 flex w-[300px] flex-col rounded-lg bg-black-pearl-dark p-4">
                    <p className="mb-4 text-lg font-bold text-white">
                        Account Controls
                    </p>
                    <div className="flex flex-row items-center justify-between">
                        <button
                            onClick={() => void signOut({ callbackUrl: '/' })}
                            className="rounded-full bg-valencia px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-white hover:text-black-pearl-dark"
                        >
                            Sign Out
                        </button>

                        {AdminPanelButton && AdminPanelButton}
                    </div>
                </div>
                <div className="z-2 relative mt-4 flex flex-row rounded-lg bg-black-pearl-dark p-4 text-xs text-white shadow-lg">
                    <InformationCircleIcon className="mr-1 size-4 rounded-full bg-white text-steel-blue" />
                    Pardon our dust while we work on this page
                </div>
            </div>
        </MainLayout>
    )
}
