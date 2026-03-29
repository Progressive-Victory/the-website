'use client'

import styles from './DonorView.module.css'
import { ListBody } from '@/app/admin/layout/List'
import {
    DateField,
    Form,
    FormGroup,
    TextField,
} from '@/components/common/forms'
import { InfoBlock } from '@/components/common/panel_block/Block'
import {
    BlockList,
    BlockListTag,
    type BlockListItem,
} from '@/components/common/panel_block/BlockList'
import { BlockField } from '@/components/common/panel_block/block_fields/BlockField'
import blockFieldStyles from '@/components/common/panel_block/block_fields/BlockField.module.css'
import { PhoneBlockField } from '@/components/common/panel_block/block_fields/PhoneBlockField'
import {
    ActBlueContribution,
    ActBlueContributionCustomField,
    ActBlueDonor,
    ActBlueLineitem,
    User,
} from '@/contracts/data'
import type { SearchRequest } from '@/contracts/requests'
import type { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import type { UseQueryResult } from '@tanstack/react-query'
import cx from 'classnames'
import { motion } from 'motion/react'
import Link from 'next/link'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'

export interface DonorViewProps {
    selectedId: number
    user: User

    pickingDonor: boolean
    setPickingDonor: (next: boolean) => void

    isRefetching: boolean

    donorSearch: SearchRequest
    donorSearchQuery: UseQueryResult<
        PaginatedResponse<ActBlueDonor>,
        FetchError
    >
    onDonorSearch: (req: SearchRequest) => void

    renderDonorItem: (item: ActBlueDonor, userId: number) => React.ReactNode
    handleDeleteDonorItem: (value: ActBlueDonor, userId: number) => void
}

interface ContributionData {
    total: number
    largestContribution: number
    largestContributionForm?: string
    largestContributionDate?: Date
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
    const li: { lineitem: ActBlueLineitem; form: string }[] = []
    let hasActiveRecurring = false
    let total = 0
    let customFields: ActBlueContributionCustomField[] = []

    ;(donor.contributions ?? []).forEach(
        (contribution: ActBlueContribution) => {
            customFields = contribution.customFields
            if (
                contribution.isRecurring &&
                ((contribution.recurringDuration ?? 1) < 0 ||
                    calcFutureDate(
                        contribution.createdAt,
                        contribution.recurringPeriod as 'weekly' | 'monthly',
                        contribution.recurringDuration ?? 1
                    ) > new Date())
            )
                hasActiveRecurring = true
            ;(contribution.lineitems ?? []).forEach(
                (lineitem: ActBlueLineitem) => {
                    total += lineitem.amount
                    li.push({ lineitem, form: contribution.contributionForm })
                }
            )
        }
    )

    const largestEntry = li.reduce<{ lineitem: ActBlueLineitem; form: string } | null>(
        (max, entry) =>
            max === null || entry.lineitem.amount > max.lineitem.amount
                ? entry
                : max,
        null
    )

    return {
        total,
        largestContribution: largestEntry?.lineitem.amount ?? 0,
        largestContributionForm: largestEntry?.form,
        largestContributionDate: largestEntry?.lineitem.paidAt,
        hasActiveRecurring,
        customFields,
        lineitems: li.map((e) => e.lineitem),
    }
}

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
    const router = useRouter()
    const linkedDonors = user.donors ?? []
    const hasLinked = linkedDonors.length > 0

    const openPicker = () => setPickingDonor(true)
    const closePicker = () => setPickingDonor(false)

    const unlinkAll = () => {
        for (const donor of linkedDonors) {
            handleDeleteDonorItem(donor, selectedId)
        }
    }

    const queryValue = useMemo(
        () => donorSearch.query ?? '',
        [donorSearch.query]
    )

    const handleOverlaySearch = (e: ChangeEvent<HTMLInputElement>) => {
        onDonorSearch({ ...donorSearch, query: e.target.value })
    }

    const [overlayMounted, setOverlayMounted] = useState(false)
    const [overlayOpen, setOverlayOpen] = useState(false)

    useEffect(() => {
        if (pickingDonor) {
            setOverlayMounted(true)
            requestAnimationFrame(() => setOverlayOpen(true))
        } else if (overlayMounted) {
            setOverlayOpen(false)
        }
    }, [pickingDonor, overlayMounted])

    const backdropVariants = {
        open: {
            opacity: 1,
            backdropFilter: 'blur(10px) saturate(140%)',
        },
        closed: {
            opacity: 0,
            backdropFilter: 'blur(0px) saturate(140%)',
        },
    } as const

    const modalVariants = {
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
        },
        closed: {
            opacity: 0,
            y: 10,
            scale: 0.985,
        },
    } as const

    const backdropTransition = {
        duration: 0.22,
        ease: [0.2, 0.9, 0.2, 1],
    } as const

    const modalTransition = {
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1],
    } as const

    return (
        <div className={styles.root}>
            {!hasLinked && (
                <InfoBlock
                    title="No Donors Found"
                    subtitle="Automatic donor matching not implemented yet."
                    user={user}
                >
                    <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={openPicker}
                    >
                        Search Donors
                    </button>
                </InfoBlock>
            )}

            {hasLinked && (
                <div className={styles.infoRow}>
                    <div className={styles.infoRowLeft}>
                        {linkedDonors.map((donor) => {
                            const contributionData = calcContributionData(donor)
                            return (
                                <React.Fragment key={`left-${donor.email}`}>
                                    <InfoBlock
                                        title="All Time Stats"
                                        user={user}
                                    >
                                        <BlockField
                                            label="Total Donated"
                                            getter={() =>
                                                `$${contributionData.total.toFixed(2)}`
                                            }
                                        />
                                        <BlockField
                                            label="Active Recurring"
                                            getter={() =>
                                                `${contributionData.hasActiveRecurring}`
                                            }
                                        />
                                        <BlockField
                                            label="Contributions"
                                            getter={() =>
                                                `${contributionData.lineitems.length}`
                                            }
                                        />
                                        <BlockField
                                            label="Largest Contribution"
                                            getter={() =>
                                                `$${contributionData.largestContribution.toFixed(2)}`
                                            }
                                            sourceLabel="Contribution Form"
                                            sourceValue={contributionData.largestContributionForm}
                                            lastUpdatedLabel="Date"
                                            lastUpdatedValue={contributionData.largestContributionDate?.toLocaleString([], {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        />
                                    </InfoBlock>
                                    <InfoBlock
                                        title="Donor Information"
                                        user={user}
                                    >
                                        <BlockField
                                            label="Donor Name"
                                            getter={() =>
                                                [donor.firstname, donor.lastname]
                                                    .filter(Boolean)
                                                    .join(' ') || '-'
                                            }
                                        />
                                        <BlockField
                                            label="Donor Email"
                                            getter={() => donor.email ?? '-'}
                                        />
                                        <PhoneBlockField
                                            label="Donor Phone Number"
                                            getter={() => donor.phone}
                                        />
                                        <div
                                            className={`${blockFieldStyles.infoBlockFieldRow} ${blockFieldStyles.infoBlockFieldRowMultiline}`}
                                        >
                                            <span
                                                className={
                                                    blockFieldStyles.infoBlockFieldLabel
                                                }
                                            >
                                                Donor Address
                                            </span>
                                            <button
                                                type="button"
                                                className={`${blockFieldStyles.infoBlockInfoButton} ${blockFieldStyles.infoBlockInfoButtonMultiline}`}
                                                aria-label="Full address info"
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                        gap: '0.1rem',
                                                    }}
                                                >
                                                    {(() => {
                                                        const cityState = [
                                                            donor.city,
                                                            donor.state,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(', ')
                                                        const cityStateZip = [
                                                            cityState,
                                                            donor.zip,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')
                                                        const lines = [
                                                            donor.addr1,
                                                            cityStateZip,
                                                            donor.country,
                                                        ].filter(Boolean)
                                                        return lines.length > 0 ? (
                                                            lines.map((line, index) => (
                                                                <span
                                                                    key={`${line}-${index}`}
                                                                    className={`${blockFieldStyles.infoBlockFieldValue} ${blockFieldStyles.infoBlockFieldValueLine}`}
                                                                >
                                                                    {line}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span
                                                                className={
                                                                    blockFieldStyles.infoBlockFieldValue
                                                                }
                                                            >
                                                                -
                                                            </span>
                                                        )
                                                    })()}
                                                </div>
                                                <InformationCircleIcon
                                                    className={
                                                        blockFieldStyles.infoBlockInfoIcon
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </InfoBlock>
                                </React.Fragment>
                            )
                        })}
                    </div>

                    <div className={styles.infoRowRight}>
                        {linkedDonors.map((donor) => {
                            const contributionItems: BlockListItem[] = (
                                donor.contributions ?? []
                            ).flatMap((contribution) =>
                                (contribution.lineitems ?? []).map(
                                    (lineitem) => ({
                                        key: lineitem.lineitemId,
                                        label: `$${lineitem.amount.toFixed(2)}`,
                                        subtitle: (
                                            <>
                                                <span>{lineitem.paidAt.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                                <span>{contribution.contributionForm}</span>
                                            </>
                                        ),
                                        tag: (
                                            <BlockListTag>
                                                {contribution.isRecurring
                                                    ? 'Recurring'
                                                    : 'One-Time'}
                                            </BlockListTag>
                                        ),
                                        onClick: () => router.push(`/admin/panels/contributions?lineitemId=${lineitem.lineitemId}`),
                                        _paidAt: lineitem.paidAt,
                                    })
                                )
                            ).sort((a, b) => b._paidAt.getTime() - a._paidAt.getTime())
                            return (
                                <BlockList
                                    key={`contributions-${donor.email}`}
                                    title="Contributions"
                                    items={contributionItems}
                                    pageSize={5}
                                    emptyMessage="No contributions found"
                                />
                            )
                        })}
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

                            return (
                                <div
                                    key={donor.email}
                                    className={styles.donorCard}
                                >
                                    <div className={styles.donorCardTop}>
                                        <div className={styles.donorCardTitle}>
                                            {donor.firstname} {donor.lastname}
                                        </div>
                                    </div>

                                    <Form<ActBlueDonor>
                                        key={donor.userId}
                                        title=""
                                        readonly
                                        form={donor}
                                        onSave={() => {
                                            return
                                        }}
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

                                            <FormGroup title="Address" subGroup>
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
                                                title="Contributions"
                                                wrapper
                                                subGroup
                                            >
                                                <FormGroup
                                                    title="All Time Stats"
                                                    subGroup
                                                >
                                                    <TextField<ActBlueDonor>
                                                        label="Total Dollar Donations"
                                                        getter={() =>
                                                            `$${contributionData.total.toFixed(2)}`
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
                                                        title={`${lineitem.lineitemId}`}
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
                                                                    '/admin/panels/contributions',
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
                                                <Link
                                                    href={{
                                                        pathname:
                                                            '/admin/panels/donors',
                                                        query: {
                                                            email: donor.email,
                                                        },
                                                    }}
                                                >
                                                    Open in Donors Panel
                                                </Link>
                                            </FormGroup>
                                        </FormGroup>
                                    </Form>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {overlayMounted ? (
                <motion.div
                    className={styles.modalBackdrop}
                    role="presentation"
                    initial="closed"
                    animate={overlayOpen ? 'open' : 'closed'}
                    variants={backdropVariants}
                    transition={backdropTransition}
                    onAnimationComplete={() => {
                        if (!overlayOpen) setOverlayMounted(false)
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closePicker()
                    }}
                >
                    <motion.div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Link donor"
                        initial="closed"
                        animate={overlayOpen ? 'open' : 'closed'}
                        variants={modalVariants}
                        transition={modalTransition}
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <div className={styles.modalTitle}>
                                    Link Donors
                                </div>
                                <div className={styles.modalSubtitle}>
                                    Search ActBlue donors and link one to this
                                    user.
                                </div>
                            </div>

                            <div className={styles.modalHeaderRight}>
                                <div className={styles.modalSearch}>
                                    <div className={styles.searchInputBare}>
                                        <input
                                            type="text"
                                            name="donorSearch"
                                            id="donorSearch"
                                            placeholder="Search..."
                                            value={queryValue}
                                            onChange={handleOverlaySearch}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            <ListBody
                                count={donorSearchQuery.data?.count}
                                isPending={donorSearchQuery.isPending}
                                error={donorSearchQuery.error}
                            >
                                {donorSearchQuery.data?.data.map((donor) =>
                                    renderDonorItem(donor, selectedId)
                                )}
                            </ListBody>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={cx(
                                    styles.ghostButton,
                                    styles.modalFooterButton
                                )}
                                onClick={closePicker}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </div>
    )
}
