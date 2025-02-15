'use client'
import { MainLayout } from '@/components/MainLayout'
import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function Account() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (!session) {
            router.push('/login')
        }
    }, [session])

    if (!session) {
        return null
    } else {
        return (
            <MainLayout>
                <div className="bg-steel-blue w-full h-screen">
                    <button
                        onClick={() => signOut()}
                        className="bg-valencia text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-black transition duration-300 ease-in-out"
                    >
                        Sign Out
                    </button>
                </div>
            </MainLayout>
        )
    }
}
