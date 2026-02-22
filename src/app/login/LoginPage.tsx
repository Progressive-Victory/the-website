'use client'

import { LoginCard } from './LoginCard'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function Login() {
    const params = useSearchParams()
    const redirect = params.get('redirect')

    return (
        <MainLayout>
            <div
                className="absolute right-0 top-0 size-full lg:w-1/2"
                style={{
                    backgroundImage: "url('/images/memorial.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'left',
                    mixBlendMode: 'lighten',
                }}
            />
            <HalftoneBackground />

            <div className="z-2 relative flex h-screen w-full flex-col items-center justify-center px-2">
                <Suspense>
                    <LoginCard redirect={redirect ?? '/account'} />
                </Suspense>
                <div className="mt-4 flex flex-row items-center rounded-lg bg-black-pearl-dark p-4 text-xs text-white shadow-lg">
                    <InformationCircleIcon className="mr-1 size-4 rounded-full bg-white text-steel-blue" />
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
