'use client'

import styles from './DonorView.module.css'
import { ListBody } from '@/app/admin/layout/List'
import { SearchModal } from '@/app/admin/layout/SearchModal'
import {
    DateField,
    Form,
    FormGroup,
    TextField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import {
    ActBlueContribution,
    ActBlueContributionCustomField,
    ActBlueDonor,
    ActBlueLineitem,
    User,
} from '@/contracts/data'
import type { SearchRequest } from '@/contracts/requests'
import type { PaginatedResponse } from '@/contracts/responses'
import type { UseQueryResult } from '@tanstack/react-query'
import Link from 'next/link'
import React, { ChangeEvent } from 'react'

export interface DonorViewProps {
    selectedId: number
    user: User

    pickingDonor: boolean
    setPickingDonor: (next: boolean) => void

    isRefetching: boolean

    donorSearch: SearchRequest
    donorSearchQuery: UseQueryResult<PaginatedResponse<ActBlueDonor>, Error>
    onDonorSearch: (req: SearchRequest) => void

    renderDonorItem: (item: ActBlueDonor, userId: number) => React.ReactNode
    handleDeleteDonorItem: (value: ActBlueDonor, userId: number) => void
}

interface ContributionData {
    total: number
    hasActiveRecurring: boolean
    customFields: ActBlueContributionCustomField[]
    lineitems: ActBlueLineitem[]
}

const calcFutureDate = (
    initialTime: Date,
    period: 'weekly' | 'monthly',
    duration: number
) => {
    switch (period) {
        case 'weekly':
            return new Date(
                initialTime.getTime() +
                    new Date(duration * 7 * 24 * 60 * 60 * 1000).getTime()
            )
        case 'monthly':
            initialTime.setMonth(initialTime.getMonth())
            return initialTime
    }
}

const calcContributionData = (donor: ActBlueDonor): ContributionData => {
    const li: ActBlueLineitem[] = []
    let hasActiveRecurring = false
    let total = 0
    let customFields: ActBlueContributionCustomField[] = []

    const contributions = donor.contributions ?? []
    contributions.forEach((contribution: ActBlueContribution) => {
        customFields = contribution.customFields
        if (
            contribution.isRecurring &&
            ((contribution.recurringDuration ?? 1) < 0 ||
                calcFutureDate(
                    contribution.createdAt,
                    contribution.recurringPeriod as 'weekly' | 'monthly',
                    contribution.recurringDuration ?? 1
                ) > new Date())
        ) {
            hasActiveRecurring = true
        }

        const lineitems = contribution.lineitems ?? []
        lineitems.forEach((lineitem: ActBlueLineitem) => {
            total += lineitem.amount
            li.push(lineitem)
        })
    })

    return {
        total,
        hasActiveRecurring,
        customFields,
        lineitems: li,
    }
}

const formatLineitemDate = (value: Date) =>
    Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(value)

export function DonorView({
    selectedId,
    user,
    pickingDonor,
    setPickingDonor,
    isRefetching,
    donorSearch,
    donorSearchQuery,
    onDonorSearch,
    renderDonorItem,
    handleDeleteDonorItem,
}: DonorViewProps) {
    const formatContributionDateTime = (date: Date): string => {
        if (Number.isNaN(date.getTime())) return 'Unknown date'

        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date)
    }

    const linkedDonors = user.donors ?? []
    const hasLinked = linkedDonors.length > 0

    const openPicker = () => setPickingDonor(true)
    const closePicker = () => setPickingDonor(false)

    const unlinkAll = () => {
        for (const donor of linkedDonors) {
            handleDeleteDonorItem(donor, selectedId)
        }
    }

    const queryValue = donorSearch.query ?? ''

    const handleOverlaySearch = (e: ChangeEvent<HTMLInputElement>) => {
        onDonorSearch({ ...donorSearch, query: e.target.value })
    }

    return (
        <div className={styles.root}>
            {!hasLinked && (
                <div className={styles.emptyStage}>
                    <div className={styles.emptyCard}>
                        <div className={styles.emptyCardHeader}>
                            <div className={styles.emptyTitle}>
                                No Donors Found
                            </div>
                            <div className={styles.emptySubtitle}>
                                Automatic donor matching not implemented yet.
                            </div>
                        </div>

                        <div className={styles.emptyActions}>
                            <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={openPicker}
                            >
                                Search Donors
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hasLinked && (
                <div className={styles.linkedStage}>
                    <div className={styles.linkedHeader}>
                        <div className={styles.linkedHeaderLeft}>
                            <div className={styles.linkedTitle}>
                                Donor Details
                            </div>
                            <div className={styles.linkedSubtitle}>
                                View donor information sourced from ActBlue
                                contributions.
                            </div>
                        </div>

                        <div className={styles.linkedHeaderRight}>
                            {isRefetching ? (
                                <span className={styles.refetchingPill}>
                                    Loading...
                                </span>
                            ) : null}

                            <button
                                type="button"
                                className={styles.ghostDangerButton}
                                onClick={unlinkAll}
                            >
                                Remove Match
                            </button>
                        </div>
                    </div>

                    <div className={styles.linkedList}>
                        {linkedDonors.map((donor) => {
                            const contributionData = calcContributionData(donor)
                            const contributionFormByLineitemId = new Map<
                                number,
                                string
                            >()
                            const contributionIsRecurringByLineitemId = new Map<
                                number,
                                boolean
                            >()

                            const contributions = donor.contributions ?? []
                            contributions.forEach(
                                (contribution: ActBlueContribution) => {
                                    const lineitems =
                                        contribution.lineitems ?? []
                                    lineitems.forEach(
                                        (lineitem: ActBlueLineitem) => {
                                            contributionFormByLineitemId.set(
                                                lineitem.lineitemId,
                                                contribution.contributionForm
                                            )
                                            contributionIsRecurringByLineitemId.set(
                                                lineitem.lineitemId,
                                                contribution.isRecurring
                                            )
                                        }
                                    )
                                }
                            )

                            return (
                                <div key={donor.email}>
                                    <div className={styles.donorCard}>
                                        <Form<ActBlueDonor>
                                            key={donor.userId}
                                            title=""
                                            readonly
                                            form={donor}
                                        >
                                            <FormGroup title="" wrapper>
                                                <FormGroup
                                                    title="Contact Info"
                                                    subGroup
                                                >
                                                    <TextField
                                                        label="First Name"
                                                        field="firstname"
                                                        required
                                                    />
                                                    <TextField
                                                        label="Last Name"
                                                        field="lastname"
                                                        required
                                                    />
                                                    <TextField
                                                        label="Email"
                                                        field="email"
                                                        readonly
                                                    />
                                                    <TextField
                                                        label="Phone Number"
                                                        field="phone"
                                                    />
                                                </FormGroup>

                                                <FormGroup
                                                    title="Address"
                                                    subGroup
                                                >
                                                    <TextField
                                                        label="Street Address"
                                                        field="addr1"
                                                    />
                                                    <TextField
                                                        label="City"
                                                        field="city"
                                                    />
                                                    <TextField
                                                        label="State"
                                                        field="state"
                                                    />
                                                    <TextField
                                                        label="Zip Code"
                                                        field="zip"
                                                    />
                                                    <TextField
                                                        label="Country"
                                                        field="country"
                                                    />
                                                </FormGroup>

                                                <FormGroup
                                                    title="Employer Info"
                                                    subGroup
                                                >
                                                    <TextField<ActBlueDonor>
                                                        label="Employer Name"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.employer
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Occupation"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.occupation
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Employer Street Address"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.employerAddr1
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Employer City"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.employerCity
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Employer State"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.employerState
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Employer Zip Code"
                                                        getter={(form) =>
                                                            `${form.employerData?.employerZip ?? ''}`
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Employer Country"
                                                        getter={(form) =>
                                                            form.employerData
                                                                ?.employerCountry
                                                        }
                                                    />
                                                </FormGroup>

                                                <FormGroup
                                                    title="All Time Stats"
                                                    subGroup
                                                >
                                                    <TextField<ActBlueDonor>
                                                        label="Total Dollar Donations"
                                                        getter={() =>
                                                            `$${contributionData.total}`
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Currently Has a Recurring Donation"
                                                        getter={() =>
                                                            `${contributionData.hasActiveRecurring}`
                                                        }
                                                    />
                                                    <TextField<ActBlueDonor>
                                                        label="Total Contributions"
                                                        getter={() =>
                                                            `${contributionData.lineitems.length}`
                                                        }
                                                    />
                                                </FormGroup>

                                                {(
                                                    contributionData.lineitems ??
                                                    []
                                                ).map((lineitem) => (
                                                    <FormGroup
                                                        title={`Donated $${lineitem.amount}`}
                                                        subtitle={formatLineitemDate(
                                                            lineitem.paidAt
                                                        )}
                                                        key={
                                                            lineitem.lineitemId
                                                        }
                                                        defaultCollapsed
                                                        subGroup
                                                    >
                                                        <DateField<ActBlueDonor>
                                                            label="Paid At"
                                                            getter={() =>
                                                                lineitem.paidAt
                                                            }
                                                        />
                                                        <TextField<ActBlueDonor>
                                                            label="Sequence"
                                                            getter={() =>
                                                                `${lineitem.sequence}`
                                                            }
                                                        />
                                                        <TextField<ActBlueDonor>
                                                            label="Amount"
                                                            getter={() =>
                                                                `$${lineitem.amount}`
                                                            }
                                                        />
                                                        <TextField<ActBlueDonor>
                                                            label="Recurring Amount"
                                                            getter={() =>
                                                                `$${lineitem.recurringAmount}`
                                                            }
                                                        />
                                                        <TextField<ActBlueDonor>
                                                            label="Amount Less AB Fees"
                                                            getter={() =>
                                                                `$${lineitem.amountLessAbFees}`
                                                            }
                                                        />
                                                        <TextField
                                                            label="Form Name"
                                                            field="contributionForm"
                                                            getter={() =>
                                                                donor
                                                                    .contributions?.[0]
                                                                    ?.contributionForm
                                                            }
                                                        />
                                                        {contributionData.customFields?.map(
                                                            (field) => (
                                                                <TextField
                                                                    key={
                                                                        field.id
                                                                    }
                                                                    label={
                                                                        field.label
                                                                    }
                                                                    getter={() =>
                                                                        field.answer
                                                                    }
                                                                />
                                                            )
                                                        )}

                                                        <NavigationButton
                                                            className={
                                                                styles.detailsNavigationButton
                                                            }
                                                            href={`/volunteer_dashboard/panels/contributions?lineitemId=${lineitem.lineitemId}`}
                                                            label="Full Details"
                                                            trackPanelHistory
                                                            linkClassName={
                                                                styles.detailsNavigationLink
                                                            }
                                                            labelClassName={
                                                                styles.detailsNavigationLabel
                                                            }
                                                            tagSectionClassName={
                                                                styles.detailsNavigationTagSection
                                                            }
                                                        />
                                                    </FormGroup>
                                                ))}
                                                <NavigationButton
                                                    className={
                                                        styles.detailsNavigationButton
                                                    }
                                                    href={`/volunteer_dashboard/panels/donors?email=${donor.email}`}
                                                    label="Open in Donors Panel"
                                                    trackPanelHistory
                                                    linkClassName={
                                                        styles.detailsNavigationLink
                                                    }
                                                    labelClassName={
                                                        styles.detailsNavigationLabel
                                                    }
                                                    tagSectionClassName={
                                                        styles.detailsNavigationTagSection
                                                    }
                                                />
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className={styles.donorCard}>
                                        <Form<ActBlueDonor>
                                            key={donor.userId}
                                            title=""
                                            readonly
                                            form={donor}
                                        >
                                            <FormGroup title="" wrapper>
                                                <FormGroup
                                                    title="Contributions"
                                                    wrapper
                                                    subGroup
                                                >
                                                    {[
                                                        ...(contributionData.lineitems ??
                                                            []),
                                                    ]

                                                        .sort(
                                                            (a, b) =>
                                                                b.paidAt.getTime() -
                                                                a.paidAt.getTime()
                                                        )
                                                        .map((lineitem) => (
                                                            <FormGroup
                                                                title={`Donated $${lineitem.amount}`}
                                                                subtitle={`${formatContributionDateTime(lineitem.paidAt)} · ${contributionFormByLineitemId.get(lineitem.lineitemId) ?? 'Unknown form'}`}
                                                                key={
                                                                    lineitem.lineitemId
                                                                }
                                                                defaultCollapsed
                                                                subGroup
                                                            >
                                                                <DateField<ActBlueDonor>
                                                                    label="Paid At"
                                                                    getter={() =>
                                                                        lineitem.paidAt
                                                                    }
                                                                />
                                                                <TextField<ActBlueDonor>
                                                                    label="Sequence"
                                                                    getter={() =>
                                                                        `${lineitem.sequence}`
                                                                    }
                                                                />
                                                                <TextField<ActBlueDonor>
                                                                    label="Is Recurring"
                                                                    getter={() =>
                                                                        `${
                                                                            contributionIsRecurringByLineitemId.get(
                                                                                lineitem.lineitemId
                                                                            ) ??
                                                                            false
                                                                        }`
                                                                    }
                                                                />
                                                                <TextField<ActBlueDonor>
                                                                    label="Amount"
                                                                    getter={() =>
                                                                        `$${lineitem.amount}`
                                                                    }
                                                                />
                                                                <TextField<ActBlueDonor>
                                                                    label="Recurring Amount"
                                                                    getter={() =>
                                                                        `$${lineitem.recurringAmount}`
                                                                    }
                                                                />
                                                                <TextField
                                                                    label="Form Name"
                                                                    field="contributionForm"
                                                                    getter={() =>
                                                                        contributionFormByLineitemId.get(
                                                                            lineitem.lineitemId
                                                                        )
                                                                    }
                                                                />
                                                                <br />
                                                                {contributionData.customFields?.map(
                                                                    (field) => (
                                                                        <TextField
                                                                            key={
                                                                                field.id
                                                                            }
                                                                            label={
                                                                                field.label
                                                                            }
                                                                            getter={() =>
                                                                                field.answer
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                                <br />
                                                                <Link
                                                                    href={{
                                                                        pathname:
                                                                            '/volunteer_dashboard/panels/contributions',
                                                                        query: {
                                                                            lineitemId:
                                                                                lineitem.lineitemId,
                                                                        },
                                                                    }}
                                                                >
                                                                    Full Details
                                                                </Link>
                                                            </FormGroup>
                                                        ))}
                                                    <br />
                                                </FormGroup>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <SearchModal
                open={pickingDonor}
                onClose={closePicker}
                title="Link Donors"
                subtitle="Search ActBlue donors and link one to this user."
                searchValue={queryValue}
                onSearchChange={handleOverlaySearch}
            >
                <ListBody
                    count={donorSearchQuery.data?.count}
                    isPending={donorSearchQuery.isPending}
                    error={donorSearchQuery.error}
                >
                    {donorSearchQuery.data?.data.map((donor) =>
                        renderDonorItem(donor, selectedId)
                    )}
                </ListBody>
            </SearchModal>
        </div>
    )
}
