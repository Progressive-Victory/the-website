'use client'

import styles from './page.module.css'
import {
    FormState,
    Form,
    TextField,
    FormGroup,
    DateField,
} from '@/components/common/forms'
import { Nav } from '@/components/common/nav'
import {
    Detail,
    List,
    Sidebar,
    SplitView,
} from '@/components/common/split_view'
import {
    readPanelHistory,
    writePanelHistory,
} from '@/components/common/split_view/history/panelHistory'
import card from '@/components/common/split_view/panelCard.module.css'
import {
    ActBlueDonor,
    zActBlueDonor,
    ActBlueContribution,
    ActBlueLineitem,
    ActBlueContributionCustomField,
} from '@/contracts/data'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

interface contributionData {
    total: number
    hasActiveRecurring: boolean
    customFields: ActBlueContributionCustomField[]
    lineitems: ActBlueLineitem[]
}

const DONOR_FIELD_OPTIONS = [
    { value: 'firstname', label: 'First Name' },
    { value: 'lastname', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'state', label: 'State' },
]

const DONOR_SORT_FIELD_OPTIONS = DONOR_FIELD_OPTIONS.filter(
    (option) => option.value !== 'state'
)

export default function Page() {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navEmail = navParams.get('email')
    const pathname = usePathname()

    const trackPanelHistory = () => {
        if (typeof window === 'undefined') return
        if (!pathname.startsWith('/admin/panels/')) return
        const history = readPanelHistory()
        const next =
            history[history.length - 1] === pathname
                ? history
                : [...history, pathname]
        writePanelHistory(next)
    }

    const [selectedEmail, setSelectedEmail] = useState<string | null>(navEmail)
    const [formState, setFormState] = useState<FormState<ActBlueDonor> | null>(
        null
    )
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

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

    useEffect(() => {
        setSelectedEmail(navEmail)
    }, [navEmail])

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
        let customFields: ActBlueContributionCustomField[] = []
        ;(donorQuery.data?.contributions ?? []).forEach(
            (contribution: ActBlueContribution) => {
                customFields = contribution.customFields
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
            customFields,
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

    const formatLineitemDate = (value: Date) =>
        Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(value)

    const donors = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count

    return (
        <div className={card.card}>
            <SplitView selected={isDesktop || !sidebarMobileVisible}>
                <SplitView.Sidebar>
                    <Sidebar
                        variant="prominent"
                        largeTitle
                        className={styles.sidebarBg}
                    >
                        <Sidebar.Header>
                            <Sidebar.Title large>Donors</Sidebar.Title>
                            <Sidebar.Search>
                                <List.Search
                                    search={search}
                                    onSearch={onSearch}
                                />
                            </Sidebar.Search>
                            <Sidebar.Actions slot="right">
                                <Sidebar.FilterButton>
                                    <List.Filters
                                        search={search}
                                        onSearch={onSearch}
                                        searchFieldOptions={DONOR_FIELD_OPTIONS}
                                        sortFieldOptions={
                                            DONOR_SORT_FIELD_OPTIONS
                                        }
                                        showSort
                                        showLimit
                                    />
                                </Sidebar.FilterButton>
                            </Sidebar.Actions>
                        </Sidebar.Header>

                        <Sidebar.List>
                            {searchQuery.isPending ? (
                                <div className={styles.sidebarState}>
                                    Loading...
                                </div>
                            ) : searchQuery.error ? (
                                <div
                                    className={styles.sidebarState}
                                    style={{ color: '#ef4444' }}
                                >
                                    Error: {searchQuery.error.message}
                                </div>
                            ) : donors.length === 0 ? (
                                <div className={styles.sidebarState}>
                                    No items found
                                </div>
                            ) : (
                                donors.map((donor) => (
                                    <Nav.Item
                                        key={donor.email}
                                        active={selectedEmail === donor.email}
                                        href={`/admin/panels/donors?email=${donor.email}`}
                                        label={makeTitle(donor)}
                                        showIndicator={false}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            handleSelectItem(donor)
                                            if (!isDesktop) {
                                                setSidebarMobileVisible(false)
                                            }
                                        }}
                                    />
                                ))
                            )}
                        </Sidebar.List>

                        <Sidebar.Footer>
                            <List.Footer
                                page={search.page ?? 0}
                                pageSize={search.limit ?? 25}
                                count={resultCount}
                                isPending={searchQuery.isPending}
                                onPageChange={(nextPage) =>
                                    onSearch({ ...search, page: nextPage })
                                }
                            />
                        </Sidebar.Footer>
                    </Sidebar>
                </SplitView.Sidebar>

                <SplitView.Detail>
                    <Detail>
                        <Detail.Body>
                            <div className={styles.detailPane}>
                                {!isDesktop && !sidebarMobileVisible ? (
                                    <button
                                        className={styles.mobileBackButton}
                                        onClick={() =>
                                            setSidebarMobileVisible(true)
                                        }
                                        type="button"
                                    >
                                        Donors
                                    </button>
                                ) : null}
                                {selectedEmail == null && (
                                    <div className={styles.emptyState}>
                                        No donor selected
                                    </div>
                                )}
                                {selectedEmail && donorQuery.isPending && (
                                    <div className={styles.emptyState}>
                                        Loading donor details...
                                    </div>
                                )}
                                {selectedEmail && donorQuery.error && (
                                    <div
                                        className={styles.emptyState}
                                        style={{ color: '#ef4444' }}
                                    >
                                        Error: {donorQuery.error.message}
                                    </div>
                                )}
                                {selectedEmail && donorQuery.data && (
                                    <Form<ActBlueDonor>
                                        key={selectedEmail}
                                        form={donorQuery.data}
                                        title={makeTitle(donorQuery.data)}
                                        readonly={true}
                                        saving={false}
                                        isInvalid={false}
                                        onUpdate={setFormState}
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
                                        <FormGroup title="Address">
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
                                        <FormGroup title="Employer Info">
                                            <TextField<ActBlueDonor>
                                                label="Employer Name"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.employer ?? 'N/A'
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Occupation"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.occupation ?? 'N/A'
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Employer Street Address"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.employerAddr1 ?? 'N/A'
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Employer City"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.employerCity ?? 'N/A'
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Employer State"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.employerState ?? 'N/A'
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Employer Zip Code"
                                                getter={(form) =>
                                                    `${form.employerData?.employerZip ?? 'N/A'}`
                                                }
                                            />
                                            <TextField<ActBlueDonor>
                                                label="Employer Country"
                                                getter={(form) =>
                                                    form.employerData
                                                        ?.employerCountry ??
                                                    'N/A'
                                                }
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            title="Contributions"
                                            wrapper
                                        >
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
                                                contributionData.lineitems ?? []
                                            ).map((lineitem) => (
                                                <FormGroup
                                                    title={`Donated $${lineitem.amount}`}
                                                    subtitle={formatLineitemDate(
                                                        lineitem.paidAt
                                                    )}
                                                    key={lineitem.lineitemId}
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
                                                    {contributionData.customFields?.map(
                                                        (customField) => (
                                                            <TextField
                                                                key={
                                                                    customField.id
                                                                }
                                                                label={
                                                                    customField.label
                                                                }
                                                                getter={() =>
                                                                    customField.answer
                                                                }
                                                            />
                                                        )
                                                    )}
                                                    <div
                                                        className={
                                                            styles.detailsNavigationButton
                                                        }
                                                    >
                                                        <Link
                                                            href={`/admin/panels/contributions?lineitemId=${lineitem.lineitemId}`}
                                                            className={
                                                                styles.detailsNavigationLink
                                                            }
                                                            onClick={
                                                                trackPanelHistory
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.detailsNavigationLabel
                                                                }
                                                            >
                                                                Full Details
                                                            </span>
                                                        </Link>
                                                    </div>
                                                </FormGroup>
                                            ))}
                                        </FormGroup>
                                    </Form>
                                )}
                            </div>
                        </Detail.Body>
                    </Detail>
                </SplitView.Detail>
            </SplitView>
        </div>
    )
}
