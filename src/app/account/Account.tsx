'use client'

import { MainLayout } from '@/components/layout'
import Image from 'next/image'

interface AccountProps {
    firstName: string
    lastName: string
    state: string
    city: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

// What is the name field on the user?
const Account = ({
    firstName,
    lastName,
    city,
    state,
    zip,
    addressLine1,
    addressLine2,
    emailAddress,
    phoneNumber,
}: AccountProps) => {
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
                    <form className="z-0 m-4 flex h-auto w-full max-w-[500px] flex-col justify-start gap-y-4 rounded-lg bg-slate-100 p-4 shadow-md md:m-8 md:p-6">
                        <header>
                            <p className="text-l mx-auto text-left font-bold text-black">
                                Account Information
                            </p>
                        </header>
                        <div className="flex flex-col gap-y-2">
                            <div className="flex flex-row justify-between">
                                <p>Username:</p>
                                <input></input>
                            </div>
                            {
                                //<div className="flex flex-col gap-y-2">
                                //    <p>Username:</p>
                                //    <p>Email:</p>
                                //    <p>Discord ID:</p>
                                //    <p>First Name:</p>
                                //    <p>Last Name:</p>
                                //    <p>Preferred Name:</p>
                                //    <p>Email:</p>
                                //    <p>Phone Number:</p>
                                //    <p>Date Of Birth:</p>
                                //    <p>State:</p>
                                //    <p>City:</p>
                                //    <p>Zip Code:</p>
                                //    <p>Address Line 1:</p>
                                //    <p>Address Line 2:</p>
                                //</div>
                                //<div className="flex flex-col gap-y-2">
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //    <input></input>
                                //</div>
                            }
                        </div>
                    </form>
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
            <div>
                <p>{firstName}</p>
                <p>{lastName}</p>
                <p>{city}</p>
                <p>{state}</p>
                <p>{zip}</p>
                <p>{addressLine1}</p>
                <p>{addressLine2}</p>
                <p>{emailAddress}</p>
                <p>{phoneNumber}</p>
            </div>
        </MainLayout>
    )
}

export default Account
