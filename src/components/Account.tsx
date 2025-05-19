'use client'
import { MainLayout } from '@/components/MainLayout'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { hasPermission, useUser } from '@/util/hooks'
import Link from 'next/link'

export function Account() {
    const { data: session } = useSession()
    const user = useUser()

    const AdminPanelButton = useMemo(() => {
        if (user.data && !user.error && !user.loading) {
            if (hasPermission(user.data, 'Admin Panel Access')) {
                return (
                    <Link href="/admin">
                        <button
                            className="bg-valencia text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out"
                        >
                            Admin Panel
                        </button>
                    </Link>
                )
            }
        }

        return undefined
    }, [user])

    useEffect(() => {
        // Check if the user is already on the server
        fetch('/api/discord/join')
    }, [])

    if (!session) {
        return null
    } else {
        return (
            <MainLayout>
                <div className="relative flex flex-col items-center bg-steel-blue w-full h-screen">
                    <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-1" />

                    <div className="relative flex flex-col bg-black-pearl-dark rounded-lg w-[300px] p-4 z-2 mt-20">
                        <p className="text-white text-lg font-bold mb-4">
                            Account Controls
                        </p>
                        <div className="flex flex-row items-center justify-between">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="bg-valencia text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out"
                            >
                                Sign Out
                            </button>

                            {AdminPanelButton && AdminPanelButton}
                        </div>
                    </div>
                    <div className="relative z-2 text-xs bg-black-pearl-dark rounded-lg text-white flex flex-row shadow-lg mt-4 p-4">
                        <InformationCircleIcon className="text-steel-blue bg-white rounded-full w-4 h-4 mr-1" />
                        Pardon our dust while we work on this page
                    </div>
                </div>
            </MainLayout>
        )
    }
}
