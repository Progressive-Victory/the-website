'use client'
import { useEffect, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginCard } from '@/app/login/LoginCard'

// We have to do this to comply with Next.js
export function LoginPage() {
    const { data: session } = useSession()
    const [redirect, setRedirect] = useState<string>('/account')
    const params = useSearchParams()
    const router = useRouter()
    // If we had some redirect, e.g. to volunteer form we should handle it with next-auth
    useEffect(() => {
        console.log(session)
        if (
            params.get('redirect') &&
            params.get('redirect')?.startsWith('/') &&
            !params.get('redirect')?.includes('?')
        ) {
            setRedirect(params.get('redirect') || '/')
        }

        if (session) {
            router.push('/account')
        }
    }, [params, router, session])

    return (
        <MainLayout>
            <div
                className="absolute right-0 top-0 h-full w-full lg:w-1/2"
                style={{
                    backgroundImage: "url('/images/memorial.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'left',
                    mixBlendMode: 'lighten',
                }}
            />
            <div className="halftone z-1 absolute left-0 top-0 h-full w-full opacity-10" />

            <div className="z-2 relative flex h-screen w-full flex-col items-center justify-center">
                <LoginCard signIn={signIn} redirect={redirect} />
                <div className="mt-4 flex flex-row items-center rounded-lg bg-black-pearl-dark p-4 text-xs text-white shadow-lg">
                    <InformationCircleIcon className="mr-1 h-4 w-4 rounded-full bg-white text-steel-blue" />
                    By signing in you agree to our{' '}
                    <Link
                        href="/privacy"
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="ml-1 text-steel-blue underline"
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}
