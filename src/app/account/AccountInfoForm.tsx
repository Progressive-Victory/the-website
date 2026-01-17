'use client'

import StateSelector from './StateSelector'
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

const AccountInfoForm = ({
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
        <form className="flex max-w-[550px] flex-col justify-start gap-y-4 rounded-lg bg-slate-100 p-4 shadow-md md:m-8 md:mt-0 md:p-6">
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
                        defaultValue={dateOfBirth.toISOString().split('T')[0]}
                        className={'rounded-md ring-steel-blue'}
                        onChange={(e) => {
                            if (e.target.valueAsDate) {
                                onUpdate({
                                    ...updatedForm,
                                    dateOfBirth: e.target.valueAsDate,
                                })
                            }
                        }}
                    ></input>
                </div>
                <div className="flex flex-row justify-between ">
                    <p>State:</p>
                    <StateSelector
                        initialValue={state}
                        onUpdate={(selectedState) => {
                            onUpdate({
                                ...updatedForm,
                                state: selectedState,
                            })
                        }}
                    />
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
        </form>
    )
}

export default AccountInfoForm
