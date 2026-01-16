'use client'

import StateSelector from './StateSelector'
import { MainLayout } from '@/components/layout/MainLayout'
import Image from 'next/image'
import { useState } from 'react'

interface MutableFields {
    firstName: string
    lastName: string
    preferredName: string
    dateOfBirth: Date
    state: string
    city: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

interface InitialAccountInformation extends MutableFields {
    discordUsername: string
    discordId: string
}

const Account = ({
    discordUsername,
    discordId,
    firstName,
    lastName,
    preferredName,
    dateOfBirth,
    city,
    state,
    zip,
    addressLine1,
    addressLine2,
    emailAddress,
    phoneNumber,
}: InitialAccountInformation) => {
    const [formIsUpdated, setFormIsUpdated] = useState<boolean>(false)
    const [updatedForm, setUpdatedForm] = useState<MutableFields>({
        firstName,
        lastName,
        preferredName,
        dateOfBirth,
        city,
        state,
        zip,
        addressLine1,
        addressLine2,
        emailAddress,
        phoneNumber,
    })

    console.log(updatedForm)

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
                                <input
                                    defaultValue={discordUsername}
                                    disabled
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Discord ID:</p>
                                <input
                                    defaultValue={discordId}
                                    disabled
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>First Name:</p>
                                <input
                                    defaultValue={firstName}
                                    className={'rounded-md ring-steel-blue'}
                                    onChange={(e) => {
                                        setFormIsUpdated(true)
                                        setUpdatedForm({
                                            ...updatedForm,
                                            firstName: e.target.value,
                                        })
                                    }}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Last Name:</p>
                                <input
                                    defaultValue={lastName}
                                    className={'rounded-md ring-steel-blue'}
                                    onChange={(e) => {
                                        setFormIsUpdated(true)
                                        setUpdatedForm({
                                            ...updatedForm,
                                            firstName: e.target.value,
                                        })
                                    }}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Preferred Name:</p>
                                <input
                                    defaultValue={preferredName}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Email:</p>
                                <input
                                    type="email"
                                    defaultValue={emailAddress}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Phone Number:</p>
                                <input
                                    type="tel"
                                    defaultValue={phoneNumber}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Date Of Birth:</p>
                                <input
                                    type="date"
                                    defaultValue={
                                        dateOfBirth.toISOString().split('T')[0]
                                    }
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>State:</p>
                                <StateSelector initialValue={state} />
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>city:</p>
                                <input
                                    defaultValue={city}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>ZIP Code:</p>
                                <input
                                    defaultValue={zip}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Address Line 1:</p>
                                <input
                                    defaultValue={addressLine1}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
                            <div className="flex flex-row justify-between ">
                                <p>Address Line 2:</p>
                                <input
                                    defaultValue={addressLine2}
                                    className={'rounded-md ring-steel-blue'}
                                ></input>
                            </div>
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
        </MainLayout>
    )
}

export default Account
