'use client'
import { MainLayout } from '@/components/MainLayout'
import { LoginCard } from '@/components/LoginCard'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
export default function Login() {
    const { data: session } = useSession()
    const [redirect, setRedirect] = useState<string>('/account')
    const params = useSearchParams()

    // If we had some redirect, e.g. to volunteer form we should handle it with next-auth
    useEffect(() => {
        if (
            params.get('redirect') &&
            params.get('redirect')?.startsWith('/') &&
            !params.get('redirect')?.includes('?')
        ) {
            setRedirect(params.get('redirect') || '/')
        }
    }, [params])

    return (
        <MainLayout>
            <div className="relative bg-steel-blue">
                <div
                    className="absolute top-0 right-0 w-full lg:w-1/2 h-full"
                    style={{
                        backgroundImage: "url('/images/memorial.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'left',
                        mixBlendMode: 'lighten',
                    }}
                />
                <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-1" />

                <div className="relative flex flex-col items-center justify-center w-full z-2 h-screen">
                    <LoginCard signIn={signIn} redirect={redirect} />
                    <div className="bg-black-pearl-dark rounded-lg text-white flex flex-row shadow-lg mt-4 p-4">
                        <InformationCircleIcon className="text-steel-blue bg-white rounded-full w-6 h-6 mr-1" />
                        By signing in you agree to our{' '}
                        <Link
                            href="/privacy"
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="text-steel-blue underline ml-1"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
