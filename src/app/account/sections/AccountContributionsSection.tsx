'use client'

import styles from '@/app/account/account.module.css'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { ActBlueContribution, User } from '@/contracts/data'
import { cn } from '@/util'
import React, { ChangeEvent, useState } from 'react'

export interface ManualDonorLinkRequest {
    donorEmail: string
    orderId: string
}

type RecurrencePeriod = 'one-time' | 'monthly' | 'weekly'
const RecurrenceTag = ({ type }: { type: RecurrencePeriod }) => {
    const nameMap = {
        ['one-time']: 'One Time',
        ['monthly']: 'Monthly',
        ['weekly']: 'Weekly',
    }

    return (
        <div className={cn(styles.recurringTag, styles[type])}>
            {nameMap[type]}
        </div>
    )
}

export interface ContributionsTableProps {
    lineitems: {
        contribution: ActBlueContribution
        lineitemId: number
        amount: number
        paidAt: Date
    }[]
}

const formatContributionForm = (value: string) => {
    const rawValue = value.trim()

    if (!rawValue) return 'Unknown'

    if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) {
        try {
            const parsed = new URL(rawValue)
            return parsed.pathname || rawValue
        } catch {
            return rawValue
        }
    }

    return rawValue
}

const getRecurrenceType = (
    contribution: ActBlueContribution
): RecurrencePeriod => {
    if (!contribution.isRecurring) return 'one-time'
    return contribution.recurringPeriod.toLowerCase() === 'weekly'
        ? 'weekly'
        : 'monthly'
}

const ContributionsTable = ({ lineitems }: ContributionsTableProps) => {
    return (
        <div className={styles.contributionsTableContainer}>
            <div className={styles.contributionsList}>
                <div className={styles.contributionsListHeader}>
                    <span>Recurring</span>
                    <span>Contribution Form</span>
                    <span>Order Number</span>
                    <span>Amount</span>
                    <span>Date</span>
                </div>

                {lineitems.map(
                    ({ contribution, lineitemId, amount, paidAt }) => {
                        return (
                            <div
                                key={`${contribution.uniqueIdentifier}-${lineitemId}`}
                                className={styles.contributionsListRow}
                            >
                                <span
                                    className={styles.contributionsListCell}
                                    data-label="Recurring"
                                >
                                    <RecurrenceTag
                                        type={getRecurrenceType(contribution)}
                                    />
                                </span>
                                <span
                                    className={styles.contributionsListCell}
                                    data-label="Contribution Form"
                                >
                                    {formatContributionForm(
                                        contribution.contributionForm
                                    )}
                                </span>
                                <span
                                    className={styles.contributionsListCell}
                                    data-label="Order Number"
                                >
                                    {contribution.orderNumber}
                                </span>
                                <span
                                    className={styles.contributionsListCell}
                                    data-label="Amount"
                                >
                                    ${amount.toFixed(2)}
                                </span>
                                <span
                                    className={styles.contributionsListCell}
                                    data-label="Date"
                                >
                                    {paidAt.toLocaleDateString()}
                                </span>
                            </div>
                        )
                    }
                )}
            </div>
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

    const sortedLineitems = allContributions
        .flatMap((contribution) =>
            (contribution.lineitems ?? []).map((lineitem) => ({
                contribution,
                lineitemId: lineitem.lineitemId,
                amount: lineitem.amount,
                paidAt: lineitem.paidAt,
            }))
        )
        .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())

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
        onSubmit({
            donorEmail: donorLinkForm.donorEmail.trim(),
            orderId: donorLinkForm.orderId.trim(),
        })
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
                <div className={styles.contributionsContentPanel}>
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
                            {!sortedLineitems.length ? (
                                <div className={styles.noContributionsMessage}>
                                    No contributions were found for your
                                    account.
                                </div>
                            ) : (
                                <ContributionsTable
                                    lineitems={sortedLineitems}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
