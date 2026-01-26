'use client'

import StateSelector from './StateSelector'
import styles from './accountInfoForm.module.css'
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
        <form className="flex min-w-[500px] max-w-[550px] flex-col justify-start gap-y-4 rounded-lg bg-slate-100 p-4 shadow-md">
            <header>
                <p className={styles.accountInfoTitle}>Account Information</p>
            </header>
            <div className={styles.accountInfoColumn}>
                <div className={styles.accountInfoField}>
                    <p>Username:</p>
                    <input
                        defaultValue={discordUsername}
                        disabled
                        className={styles.accountInfoInput}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Discord ID:</p>
                    <input
                        defaultValue={discordId}
                        disabled
                        className={styles.accountInfoInput}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>First Name:</p>
                    <input
                        defaultValue={firstName}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                firstName: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Last Name:</p>
                    <input
                        defaultValue={lastName}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                lastName: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Email:</p>
                    <input
                        type="email"
                        defaultValue={emailAddress}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                emailAddress: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Phone Number:</p>
                    <input
                        type="tel"
                        defaultValue={phoneNumber}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                phoneNumber: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Date Of Birth:</p>
                    <input
                        type="date"
                        defaultValue={dateOfBirth.toISOString().split('T')[0]}
                        className={styles.accountInfoInput}
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
                <div className={styles.accountInfoField}>
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
                <div className={styles.accountInfoField}>
                    <p>city:</p>
                    <input
                        defaultValue={city}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                city: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>ZIP Code:</p>
                    <input
                        defaultValue={zip}
                        type="number"
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                zip: e.target.valueAsNumber,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Address Line 1:</p>
                    <input
                        defaultValue={addressLine1}
                        className={styles.accountInfoInput}
                        onChange={(e) => {
                            onUpdate({
                                ...updatedForm,
                                addressLine2: e.target.value,
                            })
                        }}
                    ></input>
                </div>
                <div className={styles.accountInfoField}>
                    <p>Address Line 2:</p>
                    <input
                        defaultValue={addressLine2}
                        className={styles.accountInfoInput}
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
                type="button"
                disabled={!formIsUpdated}
                onClick={() => {
                    console.log(updatedForm)
                }}
            >
                Save Changes
            </button>
        </form>
    )
}

export default AccountInfoForm
