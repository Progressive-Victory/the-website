'use client'

import styles from '@/app/account/account.module.css'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { Table, Column } from '@/components/common/table'
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

type ContributionLineitem = ContributionsTableProps['lineitems'][number]

const contributionColumns: Column<ContributionLineitem>[] = [
    {
        key: 'recurring',
        header: 'Recurring',
        width: '8.5rem',
        render: (row) => (
            <RecurrenceTag type={getRecurrenceType(row.contribution)} />
        ),
    },
    {
        key: 'form',
        header: 'Contribution Form',
        render: (row) =>
            formatContributionForm(row.contribution.contributionForm),
    },
    {
        key: 'orderNumber',
        header: 'Order Number',
        width: '9rem',
        render: (row) => row.contribution.orderNumber,
    },
    {
        key: 'amount',
        header: 'Amount',
        width: '7rem',
        render: (row) => `$${row.amount.toFixed(2)}`,
    },
    {
        key: 'date',
        header: 'Date',
        width: '11rem',
        render: (row) => row.paidAt.toLocaleDateString(),
    },
]

const ContributionsTable = ({ lineitems }: ContributionsTableProps) => {
    return (
        <div className={styles.contributionsTableContainer}>
            <Table
                columns={contributionColumns}
                data={lineitems}
                rowKey={(row) =>
                    `${row.contribution.uniqueIdentifier}-${row.lineitemId}`
                }
            />
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
