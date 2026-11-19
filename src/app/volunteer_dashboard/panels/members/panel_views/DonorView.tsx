'use client'

import styles from './DonorView.module.css'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { InfoBlock } from '@/components/common/panel_block/Block'
import {
    BlockList,
    BlockListTag,
    type BlockListItem,
} from '@/components/common/panel_block/BlockList'
import { BlockField } from '@/components/common/panel_block/block_fields/BlockField'
import blockFieldStyles from '@/components/common/panel_block/block_fields/BlockField.module.css'
import { PhoneBlockField } from '@/components/common/panel_block/block_fields/PhoneBlockField'
import { cn, DOT_SEPARATOR } from '@/util'
import type { UseQueryResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
    ActBlueContribution,
    ActBlueContributionCustomField,
    ActBlueDonor,
    ActBlueLineitem,
    User,
} from 'pv-contracts/data'
import type { SearchRequest } from 'pv-contracts/requests'
import type { PaginatedResponse } from 'pv-contracts/responses'
import React, { ChangeEvent } from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi2'

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
    largestContribution: number
    largestContributionForm?: string
    largestContributionDate?: Date
    hasActiveRecurring: boolean
    customFields: ActBlueContributionCustomField[]
    lineitems: ActBlueLineitem[]
}

const dateTimeFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
    let largest: { lineitem: ActBlueLineitem; form: string } | undefined

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
            if (!largest || lineitem.amount > largest.lineitem.amount)
                largest = { lineitem, form: contribution.contributionForm }
        })
    })

    return {
        total,
        largestContribution: largest?.lineitem.amount ?? 0,
        largestContributionForm: largest?.form,
        largestContributionDate: largest?.lineitem.paidAt,
        hasActiveRecurring,
        customFields,
        lineitems: li,
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

    const renderPickerResults = () => {
        const { isPending, error, data } = donorSearchQuery
        const results = data?.data ?? []

        const renderContent = () => {
            if (isPending) return 'Loading...'
            if (error) return `Error: ${error.message}`
            if (results.length === 0) return 'No results found'
            return results.map((donor) => renderDonorItem(donor, selectedId))
        }

        return (
            <div className={cn(styles.pickerStatus, error && styles.error)}>
                {renderContent()}
            </div>
        )
    }

    const renderEmptyState = () => (
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
    )

    const renderDonorAddress = (donor: ActBlueDonor) => {
        const cityState = [donor.city, donor.state].filter(Boolean).join(', ')
        const cityStateZip = [cityState, donor.zip].filter(Boolean).join(' ')
        const lines = [donor.addr1, cityStateZip, donor.country].filter(Boolean)

        return (
            <div
                className={cn(
                    blockFieldStyles.infoBlockFieldRow,
                    blockFieldStyles.infoBlockFieldRowMultiline
                )}
            >
                <span className={blockFieldStyles.infoBlockFieldLabel}>
                    Donor Address
                </span>
                <button
                    type="button"
                    className={cn(
                        blockFieldStyles.infoBlockInfoButton,
                        blockFieldStyles.infoBlockInfoButtonMultiline
                    )}
                    aria-label="Full address info"
                >
                    <div className={styles.addressLines}>
                        {lines.length > 0 ? (
                            lines.map((line, index) => (
                                <span
                                    key={`${line}-${index}`}
                                    className={cn(
                                        blockFieldStyles.infoBlockFieldValue,
                                        blockFieldStyles.infoBlockFieldValueLine
                                    )}
                                >
                                    {line}
                                </span>
                            ))
                        ) : (
                            <span
                                className={blockFieldStyles.infoBlockFieldValue}
                            >
                                -
                            </span>
                        )}
                    </div>
                    <HiOutlineInformationCircle
                        className={blockFieldStyles.infoBlockInfoIcon}
                    />
                </button>
            </div>
        )
    }

    const renderDonorOverview = (donor: ActBlueDonor) => {
        const contributionData = calcContributionData(donor)

        return (
            <React.Fragment key={`overview-${donor.email}`}>
                <InfoBlock title="All Time Stats" user={user}>
                    <BlockField
                        label="Total Donated"
                        getter={() => `$${contributionData.total.toFixed(2)}`}
                    />
                    <BlockField
                        label="Active Recurring"
                        getter={() => `${contributionData.hasActiveRecurring}`}
                    />
                    <BlockField
                        label="Contributions"
                        getter={() => `${contributionData.lineitems.length}`}
                    />
                    <BlockField
                        label="Largest Contribution"
                        getter={() =>
                            `$${contributionData.largestContribution.toFixed(2)}`
                        }
                        sourceLabel="Contribution Form"
                        sourceValue={contributionData.largestContributionForm}
                        lastUpdatedLabel="Date"
                        lastUpdatedValue={contributionData.largestContributionDate?.toLocaleString(
                            [],
                            dateTimeFormat
                        )}
                    />
                </InfoBlock>
                <InfoBlock title="Donor Information" user={user}>
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
                    {renderDonorAddress(donor)}
                </InfoBlock>
            </React.Fragment>
        )
    }

    const renderContributionBlockList = (donor: ActBlueDonor) => {
        const items: BlockListItem[] = (donor.contributions ?? [])
            .flatMap((contribution) =>
                (contribution.lineitems ?? []).map((lineitem) => ({
                    contribution,
                    lineitem,
                }))
            )
            .sort(
                (a, b) =>
                    b.lineitem.paidAt.getTime() - a.lineitem.paidAt.getTime()
            )
            .map(({ contribution, lineitem }) => ({
                key: lineitem.lineitemId,
                label: `$${lineitem.amount.toFixed(2)}`,
                subtitle: (
                    <>
                        <span>
                            {lineitem.paidAt.toLocaleString([], dateTimeFormat)}
                        </span>
                        <span>{contribution.contributionForm}</span>
                    </>
                ),
                tag: (
                    <BlockListTag>
                        {contribution.isRecurring ? 'Recurring' : 'One-Time'}
                    </BlockListTag>
                ),
                onClick: () =>
                    router.push(
                        `/volunteer_dashboard/panels/contributions?lineitemId=${lineitem.lineitemId}`
                    ),
            }))

        return (
            <BlockList
                key={`contributions-${donor.email}`}
                title="Contributions"
                items={items}
                pageSize={5}
                emptyMessage="No contributions found"
            />
        )
    }

    const renderLinkedHeader = () => (
        <div className={styles.linkedHeader}>
            <div className={styles.linkedHeaderLeft}>
                <div className={styles.linkedTitle}>Donor Details</div>
                <div className={styles.linkedSubtitle}>
                    View donor information sourced from ActBlue contributions.
                </div>
            </div>

            <div className={styles.linkedHeaderRight}>
                {isRefetching && (
                    <span className={styles.refetchingPill}>Loading...</span>
                )}

                <button
                    type="button"
                    className={styles.ghostDangerButton}
                    onClick={unlinkAll}
                >
                    Remove Match
                </button>
            </div>
        </div>
    )

    const renderDonorSummaryFields = (
        donor: ActBlueDonor,
        contributionData: ContributionData
    ) => [
        <FormGroup title="Contact Info" key="contact" subGroup>
            <TextField label="First Name" field="firstname" required />
            <TextField label="Last Name" field="lastname" required />
            <TextField label="Email" field="email" readonly />
            <TextField label="Phone Number" field="phone" />
        </FormGroup>,

        <FormGroup title="Address" key="address" subGroup>
            <TextField label="Street Address" field="addr1" />
            <TextField label="City" field="city" />
            <TextField label="State" field="state" />
            <TextField label="Zip Code" field="zip" />
            <TextField label="Country" field="country" />
        </FormGroup>,

        <FormGroup title="Employer Info" key="employer" subGroup>
            <TextField<ActBlueDonor>
                label="Employer Name"
                getter={(form) => form.employerData?.employer}
            />
            <TextField<ActBlueDonor>
                label="Occupation"
                getter={(form) => form.employerData?.occupation}
            />
            <TextField<ActBlueDonor>
                label="Employer Street Address"
                getter={(form) => form.employerData?.employerAddr1}
            />
            <TextField<ActBlueDonor>
                label="Employer City"
                getter={(form) => form.employerData?.employerCity}
            />
            <TextField<ActBlueDonor>
                label="Employer State"
                getter={(form) => form.employerData?.employerState}
            />
            <TextField<ActBlueDonor>
                label="Employer Zip Code"
                getter={(form) => `${form.employerData?.employerZip ?? ''}`}
            />
            <TextField<ActBlueDonor>
                label="Employer Country"
                getter={(form) => form.employerData?.employerCountry}
            />
        </FormGroup>,

        <FormGroup title="All Time Stats" key="stats" subGroup>
            <TextField<ActBlueDonor>
                label="Total Dollar Donations"
                getter={() => `$${contributionData.total}`}
            />
            <TextField<ActBlueDonor>
                label="Currently Has a Recurring Donation"
                getter={() => `${contributionData.hasActiveRecurring}`}
            />
            <TextField<ActBlueDonor>
                label="Total Contributions"
                getter={() => `${contributionData.lineitems.length}`}
            />
        </FormGroup>,
    ]

    const renderContributionList = (
        contributionData: ContributionData,
        contributionFormByLineitemId: Map<number, string>,
        contributionIsRecurringByLineitemId: Map<number, boolean>
    ) => (
        <FormGroup title="Contributions" wrapper subGroup>
            {[...(contributionData.lineitems ?? [])]
                .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
                .map((lineitem) => (
                    <FormGroup
                        title={`Donated $${lineitem.amount}`}
                        subtitle={`${formatContributionDateTime(lineitem.paidAt)} ${DOT_SEPARATOR} ${contributionFormByLineitemId.get(lineitem.lineitemId) ?? 'Unknown form'}`}
                        key={lineitem.lineitemId}
                        defaultCollapsed
                        subGroup
                    >
                        <TextField<ActBlueDonor>
                            label="Sequence"
                            getter={() => `${lineitem.sequence}`}
                        />
                        <TextField<ActBlueDonor>
                            label="Is Recurring"
                            getter={() =>
                                `${contributionIsRecurringByLineitemId.get(lineitem.lineitemId) ?? false}`
                            }
                        />
                        <TextField<ActBlueDonor>
                            label="Amount"
                            getter={() => `$${lineitem.amount}`}
                        />
                        <TextField<ActBlueDonor>
                            label="Recurring Amount"
                            getter={() => `$${lineitem.recurringAmount}`}
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

                        {contributionData.customFields?.map((field) => (
                            <TextField
                                key={field.id}
                                label={field.label}
                                getter={() => field.answer}
                            />
                        ))}

                        <NavigationButton
                            className={styles.detailsNavigationButton}
                            href={`/volunteer_dashboard/panels/contributions?lineitemId=${lineitem.lineitemId}`}
                            label="Full Details"
                            trackPanelHistory
                            classNames={{
                                link: styles.detailsNavigationLink,
                                label: styles.detailsNavigationLabel,
                            }}
                            tag={{
                                className: styles.detailsNavigationTagSection,
                            }}
                        />
                    </FormGroup>
                ))}
            <br />
        </FormGroup>
    )

    const renderDonorCard = (donor: ActBlueDonor) => {
        const contributionData = calcContributionData(donor)
        const contributionFormByLineitemId = new Map<number, string>()
        const contributionIsRecurringByLineitemId = new Map<number, boolean>()

        donor.contributions?.forEach((contribution) => {
            contribution.lineitems?.forEach((lineitem) => {
                contributionFormByLineitemId.set(
                    lineitem.lineitemId,
                    contribution.contributionForm
                )
                contributionIsRecurringByLineitemId.set(
                    lineitem.lineitemId,
                    contribution.isRecurring
                )
            })
        })

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
                            {renderDonorSummaryFields(donor, contributionData)}
                            <NavigationButton
                                className={styles.detailsNavigationButton}
                                href={`/volunteer_dashboard/panels/donors?email=${donor.email}`}
                                label="Open in Donors Panel"
                                trackPanelHistory
                                classNames={{
                                    link: styles.detailsNavigationLink,
                                    label: styles.detailsNavigationLabel,
                                }}
                                tag={{
                                    className:
                                        styles.detailsNavigationTagSection,
                                }}
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
                            {renderContributionList(
                                contributionData,
                                contributionFormByLineitemId,
                                contributionIsRecurringByLineitemId
                            )}
                        </FormGroup>
                    </Form>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.root}>
            {!hasLinked && renderEmptyState()}

            {hasLinked && (
                <div className={styles.infoRow}>
                    <div className={styles.infoRowLeft}>
                        {linkedDonors.map(renderDonorOverview)}
                    </div>
                    <div className={styles.infoRowRight}>
                        {linkedDonors.map(renderContributionBlockList)}
                    </div>
                </div>
            )}

            {hasLinked && (
                <div className={styles.linkedStage}>
                    {renderLinkedHeader()}

                    <div className={styles.linkedList}>
                        {linkedDonors.map(renderDonorCard)}
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
                {renderPickerResults()}
            </SearchModal>
        </div>
    )
}
