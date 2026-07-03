'use client'

import styles from '@/app/account/account.module.css'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { ActBlueContribution, User } from '@/contracts/data'
import React, { ChangeEvent, useState } from 'react'

export interface ManualDonorLinkRequest {
    donorEmail: string
    orderId: string
}

type RecurrencePeriod = 'one-time' | 'monthly' | 'weekly'
const RecurrenceBadge = ({ type }: { type: RecurrencePeriod }) => {
    const nameMap = {
        ['one-time']: 'One Time',
        ['monthly']: 'Monthly',
        ['weekly']: 'Weekly',
    }

    return (
        <div className={`${styles.recurrenceBadge} ${styles[type]}`}>
            {nameMap[type]}
        </div>
    )
}

export interface ContributionsTableProps {
    contributions: ActBlueContribution[]
}

const ContributionsTable = ({ contributions }: ContributionsTableProps) => {
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
                                {(c.lineitems ?? [])
                                    .reduce((acc, l) => acc + l.amount, 0)
                                    .toFixed(2)}
                            </td>
                            <td>
                                {[
                                    ...new Set(
                                        (c.lineitems ?? []).map((l) =>
                                            l.paidAt.toLocaleDateString()
                                        )
                                    ),
                                ]
                                    .sort()
                                    .join(', ')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

interface AccountContributionsSectionProps {
    user: User
    error: Error | null
    onSubmit: (donorLinkForm: ManualDonorLinkRequest) => void
}

export function AccountContributionsSection({
    user,
    error,
    onSubmit,
}: AccountContributionsSectionProps) {
    const [donorLinkForm, setDonorLinkForm] = useState<ManualDonorLinkRequest>({
        donorEmail: '',
        orderId: '',
    })

    const userHasDonor = user.donors && user.donors.length > 0

    const allContributions =
        user.donors?.flatMap((d) => d.contributions ?? []) ?? []

    const handleChangeDonorEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setDonorLinkForm({
            ...donorLinkForm,
            donorEmail: e.target.value,
        })
    }

    const handleChangeOrderId = (e: ChangeEvent<HTMLInputElement>) => {
        setDonorLinkForm({
            ...donorLinkForm,
            orderId: e.target.value,
        })
    }

    const submitLinkForm = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(donorLinkForm)
    }

    return (
        <section className={styles.content}>
            <header className={styles.contentHeader}>
                <div className={styles.headerTopRow}>
                    <div className={styles.headerTextBlock}>
                        <p className={styles.pageTitle}>Contributions</p>
                        <p className={styles.pageSubtitle}>
                            {!userHasDonor
                                ? 'Link your account to your ActBlue account to view your contributions.'
                                : 'Thank you for your support!'}
                        </p>
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
                                        onChange={handleChangeDonorEmail}
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
                                        onChange={handleChangeOrderId}
                                    />
                                </label>
                            </div>
                            <button type="submit" className={formStyles.button}>
                                Link
                            </button>
                            {error && (
                                <span
                                    className={styles.linkActBlueFormErrorText}
                                >
                                    {error.message}
                                </span>
                            )}
                        </form>
                    ) : (
                        <>
                            {!allContributions.length ? (
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
