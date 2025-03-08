'use client'
import { MainLayout } from '@/components/MainLayout'
import { useSession, signOut } from 'next-auth/react'

export default function Account() {
    const { data: session } = useSession()

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
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }
}
