'use client'
import { MainLayout } from '@/components/MainLayout'
import { LoginCard } from '@/components/LoginCard'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
export default function Home() {
    const { data: session } = useSession()
    const router = useRouter()
    useEffect(() => {
        if (session) {
            router.push('/account')
        }
    }, [session])
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center bg-steel-blue w-full h-screen">
                <LoginCard signIn={signIn} />
            </div>
        </MainLayout>
    )
}
