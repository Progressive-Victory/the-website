'use client'

import styles from './page.module.css'
import { ListElement, PaginatedList } from '@/components/admin/PaginatedList'
import {
    FormState,
    Form,
    TextField,
    FormGroup,
    DateField,
} from '@/components/form'
import {
    ActBlueDonor,
    zActBlueDonor,
    ActBlueContribution,
    ActBlueLineitem,
} from '@/contracts/data'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'

interface contributionData {
    total: number
    hasActiveRecurring: boolean
    lineitems: ActBlueLineitem[]
}

export default function Page() {
    const { ready, onGet, onPatch } = useFetch()
    const navParams = useSearchParams()
    const navEmail = navParams.get('email')

    const [selectedEmail, setSelectedEmail] = useState<string | null>(navEmail)
    const [formState, setFormState] = useState<FormState<ActBlueDonor> | null>(
        null
    )

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<ActBlueDonor>('/actblue/donors', zActBlueDonor)

    const donorQuery = useQuery({
        queryKey: [`/actblue/donors/${selectedEmail}`],
        queryFn:
            ready && selectedEmail != null
                ? async () =>
                      onGet<ActBlueDonor>(
                          `/actblue/donors/${selectedEmail}`,
                          zActBlueDonor
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

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

    const contributionData = useMemo(() => {
        const li: ActBlueLineitem[] = []
        let hasActiveRecurring = false
        let total = 0
        ;(donorQuery.data?.contributions ?? []).forEach(
            (contribution: ActBlueContribution) => {
                if (
                    contribution.isRecurring &&
                    ((contribution.recurringDuration ?? 1) < 0 ||
                        calcFutureDate(
                            contribution.createdAt,
                            contribution.recurringPeriod as
                                | 'weekly'
                                | 'monthly',
                            contribution.recurringDuration ?? 1
                        ) > new Date())
                )
                    hasActiveRecurring = true
                ;(contribution.lineitems ?? []).forEach(
                    (lineitem: ActBlueLineitem) => {
                        total += lineitem.amount
                        li.push(lineitem)
                    }
                )
            }
        )

        return {
            total,
            hasActiveRecurring,
            lineitems: li,
        } satisfies contributionData
    }, [donorQuery.data])

    const handleSelectItem = (value: ActBlueDonor) => {
        if (value?.email === selectedEmail) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedEmail(value.email)
    }

    const makeTitle = (donor: ActBlueDonor) => {
        return `${donor.firstname} ${donor.lastname}`
    }

    const renderItem = (item: ActBlueDonor) => {
        return (
            <ListElement
                key={item.email}
                selected={selectedEmail == item.email}
                onClick={() => handleSelectItem(item)}
            >
                <div>
                    <span>{makeTitle(item)}</span>
                </div>
            </ListElement>
        )
    }

    return (
        <>
            <PaginatedList
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                fields={[{ value: 'email', label: 'Email' }]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => renderItem(item))}
            </PaginatedList>

            <div className={styles.detailsPane}>
                {selectedEmail == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}
                {selectedEmail && donorQuery.data && (
                    <Form<ActBlueDonor>
                        key={selectedEmail}
                        form={donorQuery.data}
                        title={makeTitle(donorQuery.data)}
                        readonly={true}
                        saving={false}
                        isInvalid={false}
                        onUpdate={() => {
                            return
                        }}
                        onSave={() => {
                            return
                        }}
                    >
                        <FormGroup title="Contact Info">
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
                            <TextField label="Email" field="email" readonly />
                            <TextField label="Phone Number" field="phone" />
                        </FormGroup>
                        <FormGroup title="Address">
                            <TextField label="Street Address" field="addr1" />
                            <TextField label="City" field="city" />
                            <TextField label="State" field="state" />
                            <TextField label="Zip Code" field="zip" />
                            <TextField label="Country" field="country" />
                        </FormGroup>
                        <FormGroup title="Employer Info">
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
                                getter={(form) =>
                                    form.employerData?.employerAddr1
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer City"
                                getter={(form) =>
                                    form.employerData?.employerCity
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer State"
                                getter={(form) =>
                                    form.employerData?.employerState
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
                                    form.employerData?.employerCountry
                                }
                            />
                        </FormGroup>
                        <FormGroup title="Contributions" wrapper>
                            <FormGroup title="All Time Stats" subGroup>
                                <TextField<ActBlueDonor>
                                    label="Total Dollar Donations"
                                    getter={() => `$${contributionData.total}`}
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
                            {(contributionData.lineitems ?? []).map(
                                (lineitem) => (
                                    <FormGroup
                                        title={`${lineitem.lineitemId}`}
                                        key={lineitem.lineitemId}
                                        defaultCollapsed
                                        subGroup
                                    >
                                        <DateField<ActBlueDonor>
                                            label="Paid At"
                                            getter={() => lineitem.paidAt}
                                        />
                                        <TextField<ActBlueDonor>
                                            label="Sequence"
                                            getter={() =>
                                                `${lineitem.sequence}`
                                            }
                                        />
                                        <TextField<ActBlueDonor>
                                            label="Amount"
                                            getter={() => `$${lineitem.amount}`}
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
                                        <br />
                                        <Link
                                            href={{
                                                pathname: `/admin/contributions`,
                                                query: {
                                                    lineitemId:
                                                        lineitem.lineitemId,
                                                },
                                            }}
                                        >
                                            Full Details
                                        </Link>
                                    </FormGroup>
                                )
                            )}
                        </FormGroup>
                    </Form>
                )}
            </div>
        </>
    )
}
