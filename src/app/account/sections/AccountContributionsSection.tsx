'use client'

import styles from '@/app/account/account.module.css'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { ActBlueContribution, User } from '@/contracts/data'
import React, { useMemo, useState } from 'react'

export interface ManualDonorLinkRequest {
    donorEmail: string
    orderId: string
    errorText?: string
}

type RecurrencePeriod = 'one-time' | 'monthly' | 'weekly'
const RecurrenceBadge = ({ type }: { type: RecurrencePeriod }) => {
    let label: string
    switch (type) {
        case 'one-time': {
            label = 'One Time'
            break
        }
        case 'monthly': {
            label = 'Monthly'
            break
        }
        case 'weekly': {
            label = 'Weekly'
            break
        }
    }

    return (
        <div className={`${styles.recurrenceBadge} ${styles[type]}`}>
            {label}
        </div>
    )
}

const ContributionsTable = ({
    contributions,
}: {
    contributions: ActBlueContribution[]
}) => {
    const numToDollarAmount = (num: number | undefined) => {
        if (num === undefined) return 0.0

        const ntos = num + ''
        console.log('ntos:', ntos.length)
        const matcher = new RegExp(/\./)
        const ntosMatches = matcher.exec(ntos)
        const length =
            ntosMatches && ntosMatches.length > 0
                ? ntos.replace('.', '').length
                : ntos.length + 2

        console.log('length: ', length)
        return num.toPrecision(length)
    }

    // TODO: replace with a better table
    return (
        <div className={styles.contributionsTableContainer}>
            <table className={styles.contributionsTable}>
                <thead>
                    <tr>
                        <th>Recurring</th>
                        <th>Order Number</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {contributions.map((c) => (
                        <tr key={c.uniqueIdentifier}>
                            <td>
                                <RecurrenceBadge
                                    type={
                                        c.isRecurring
                                            ? (c.recurringPeriod as RecurrencePeriod)
                                            : 'one-time'
                                    }
                                />
                            </td>
                            <td>{c.orderNumber}</td>
                            <td>
                                $
                                {numToDollarAmount(
                                    c.lineitems?.reduce(
                                        (acc, l) => acc + l.amount,
                                        0
                                    )
                                )}
                            </td>
                            <td>
                                {[
                                    ...new Set(
                                        c.lineitems?.map((l) =>
                                            l.paidAt.toLocaleDateString()
                                        )
                                    ),
                                ].join(', ')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

interface AccountContributionsSectionProps {
    userData: User
    onLinkFormSubmit: (
        e: React.FormEvent,
        user: User,
        donorLinkForm: ManualDonorLinkRequest
    ) => void
}

export function AccountContributionsSection({
    userData,
    onLinkFormSubmit,
}: AccountContributionsSectionProps) {
    const defaultDonorLinkForm: ManualDonorLinkRequest = {
        donorEmail: '',
        orderId: '',
    }
    const [donorLinkForm, setDonorLinkForm] =
        useState<ManualDonorLinkRequest>(defaultDonorLinkForm)

    const userHasDonor = useMemo(
        () => userData.donors && userData.donors.length > 0,
        [userData]
    )
    const donorHasContributions = useMemo(
        () =>
            userHasDonor &&
            userData.donors!.find(
                (d) => d.contributions && d.contributions.length > 0
            )
                ? true
                : false,
        [userHasDonor, userData]
    )
    const allContributions = useMemo(
        () =>
            donorHasContributions
                ? userData.donors!.flatMap((d) =>
                      d.contributions!.map((c) => c)
                  )
                : [],
        [donorHasContributions, userData]
    )

    const contribSubtitle = !userHasDonor
        ? 'Link your account to your ActBlue account to view your contributions.'
        : 'Thank you for your support!'

    const submitLinkForm = (e: React.FormEvent) => {
        const err = onLinkFormSubmit(e, userData, donorLinkForm) ?? undefined
        setDonorLinkForm({ ...defaultDonorLinkForm, errorText: err })
    }

    return (
        <section className={styles.content}>
            <header className={styles.contentHeader}>
                <div className={styles.headerTopRow}>
                    <div className={styles.headerTextBlock}>
                        <p className={styles.pageTitle}>Contributions</p>

                        <p className={styles.pageSubtitle}>{contribSubtitle}</p>
                    </div>
                </div>
            </header>

            <div className={styles.contentPanel}>
                <div className={styles.contentBackground}>
                    {!userHasDonor ? (
                        <form
                            className={styles.linkActBlueFormContainer}
                            onSubmit={submitLinkForm}
                        >
                            <div
                                className={styles.linkActBlueFormInputContainer}
                            >
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        Email Address
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={donorLinkForm.donorEmail}
                                        onChange={(e) =>
                                            setDonorLinkForm({
                                                ...donorLinkForm,
                                                donorEmail: e.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        ActBlue Order Number
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={donorLinkForm.orderId}
                                        onChange={(e) =>
                                            setDonorLinkForm({
                                                ...donorLinkForm,
                                                orderId: e.target.value,
                                            })
                                        }
                                    />
                                </label>
                            </div>
                            <button type="submit" className={formStyles.button}>
                                Link
                            </button>
                            <span className={styles.linkActBlueFormErrorText}>
                                {donorLinkForm.errorText}
                            </span>
                        </form>
                    ) : (
                        <>
                            {!donorHasContributions ? (
                                <div className={styles.noContributionsMessage}>
                                    No contributions were found for your
                                    account.
                                </div>
                            ) : (
                                <ContributionsTable
                                    contributions={allContributions}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

/*

{
    "donor": {
        "firstname": "Elsa",
        "lastname": "O'Gutkowski",
        "addr1": "672 Ladarius Rapid",
        "city": "Russelmouth",
        "state": "KY",
        "zip": "60938",
        "country": "United States",
        "isEligibleForExpressLane": false,
        "employerData": {
            "employer": "Rosenbaum-Stoltenberg",
            "occupation": "painter 11",
            "employerAddr1": null,
            "employerCity": null,
            "employerState": null,
            "employerZip": null,
            "employerCountry": null
        },
        "email": "ewell@ledner.example",
        "phone": "(589) 742-7087 x5082"
    },
    "contribution": {
        "createdAt": "2026-03-24T16:27:22.000Z",
        "orderNumber": "ABTEST1",
        "creditCardExpiration": "",
        "recurringPeriod": "monthly",
        "weeklyRecurringSunset": "",
        "isPaypal": false,
        "isMobile": false,
        "isExpress": false,
        "withExpressLane": false,
        "expressSignup": false,
        "status": "",
        "textMessageOption": "",
        "giftIdentifier": "",

        "contributionForm": "oifhtoeifnhtoiefhtofhkt",
        "refcodes": null,
        "abTestName": "test",
        "isRecurring": true,
        "abTestVariation": "test",
        "recurringDuration": "-1",
        "uniqueIdentifier": "57956758",
        "thanksUrl": "",
        "retryUrl": "",
        "giftDeclined": null,
        "shippingName": "",
        "shippingAddr1": "",
        "shippingCity": "",
        "shippingState": "",
        "shippingZip": "",
        "shippingCountry": "",
        "smartBoostAmount": null,
        "customFields": [],
        "merchandise": [],
        "bumpYourRecurring": null
    },
    "lineitems": [
        {
            "sequence": 0,
            "entityId": 0,
            "fecId": "",
            "committeeName": "comm",
            "paidAt": "2026-03-24T16:27:22.000Z",
            "lineitemId": 579567558,
            "amount": 10,
            "recurringAmount": 10,
            "amountLessAbFees": 9
        }
    ],
    "form": {
        "name": "oifhtoeifnhtoiefhtofhkt",
        "kind": "i have no idea what this is for",
        "ownerEmail": "ewell@ledner.example",
        "managingEntityName": "ent",
        "managingEntityCommitteeName": "comm"
    }
}

*/
