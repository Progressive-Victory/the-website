'use client'

import AccountInfoForm from './AccountInfoForm'
import { MainLayout } from '@/components/layout/MainLayout'
import Image from 'next/image'

interface AccountInformation {
    discordUsername: string
    discordId: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    state: string
    city: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

const Account = (accountInformation: AccountInformation) => {
    return (
        <MainLayout>
            <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />
            <div
                className="absolute right-0 top-0 size-full lg:w-1/2 lg:translate-x-1/2"
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'right',
                    mixBlendMode: 'lighten',
                    transform: 'scaleX(-1)',
                }}
            />
            <div className="w-fill z-0 m-4 flex h-auto flex-col justify-center gap-y-4 rounded-lg bg-white p-4 shadow-md md:m-8 md:p-6">
                <header>
                    <p className="mx-auto text-center text-3xl font-bold text-black">
                        Account Dashboard
                    </p>
                </header>
                <div className="flex flex-row justify-between">
                    <div className="flex grow flex-col">
                        <p className="text-3xl font-bold text-black md:p-6">
                            {accountInformation.discordUsername}
                        </p>
                        <AccountInfoForm
                            {...accountInformation}
                        ></AccountInfoForm>
                    </div>
                    <div className="flex flex-col justify-center">
                        <Image
                            src="/images/membercard_front.png"
                            alt="Front content"
                            width={480}
                            height={302}
                            className="rounded-lg"
                            priority
                            quality={100}
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Account
