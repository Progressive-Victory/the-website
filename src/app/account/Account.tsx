'use client'

import StateSelector from './StateSelector'
import { MainLayout } from '@/components/layout/MainLayout'
import Image from 'next/image'
import { useState } from 'react'

interface MutableFields {
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

interface InitialAccountInformation extends MutableFields {
    discordUsername: string
    discordId: string
}

const Account = ({
    discordUsername,
    discordId,
    firstName,
    lastName,
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
        dateOfBirth,
        city,
        state,
        zip,
        addressLine1,
        addressLine2,
        emailAddress,
        phoneNumber,
    })

    const onUpdate = (newForm: MutableFields) => {
        setUpdatedForm(newForm)
        setFormIsUpdated(true)
    }

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
                        <p className="text-3xl font-bold text-black">
                            {discordUsername}
                        </p>
                        <div className="z-0 m-4 flex h-auto w-full max-w-[550px] flex-col justify-start gap-y-4 rounded-lg bg-slate-100 p-4 shadow-md md:m-8 md:p-6">
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
                                            onUpdate({
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
                                            onUpdate({
                                                ...updatedForm,
                                                lastName: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>Email:</p>
                                    <input
                                        type="email"
                                        defaultValue={emailAddress}
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                emailAddress: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>Phone Number:</p>
                                    <input
                                        type="tel"
                                        defaultValue={phoneNumber}
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                phoneNumber: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>Date Of Birth:</p>
                                    <input
                                        type="date"
                                        defaultValue={
                                            dateOfBirth
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            if (e.target.valueAsDate) {
                                                onUpdate({
                                                    ...updatedForm,
                                                    dateOfBirth:
                                                        e.target.valueAsDate,
                                                })
                                            }
                                        }}
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
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                city: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>ZIP Code:</p>
                                    <input
                                        defaultValue={zip}
                                        type="number"
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                zip: e.target.valueAsNumber,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>Address Line 1:</p>
                                    <input
                                        defaultValue={addressLine1}
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                addressLine2: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                                <div className="flex flex-row justify-between ">
                                    <p>Address Line 2:</p>
                                    <input
                                        defaultValue={addressLine2}
                                        className={'rounded-md ring-steel-blue'}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...updatedForm,
                                                addressLine2: e.target.value,
                                            })
                                        }}
                                    ></input>
                                </div>
                            </div>
                            <button
                                className="w-full rounded-md bg-steel-blue py-2 text-lg font-bold text-white transition-all duration-100 hover:bg-valencia disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[103%]"
                                type="submit"
                                disabled={!formIsUpdated}
                            >
                                Save Changes
                            </button>
                        </div>
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
