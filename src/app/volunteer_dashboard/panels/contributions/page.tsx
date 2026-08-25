'use client'

import styles from './page.module.css'
import {
    FormGroup,
    TextField,
    Form,
    DateField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { dateService } from '@/services'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

const CONTRIBUTION_FIELD_OPTIONS = [
    { value: 'lineitem_id', label: 'Lineitem ID' },
    { value: 'order_number', label: 'Order Number' },
    { value: 'paid_at', label: 'Paid At' },
    { value: 'firstname', label: 'First Name' },
    { value: 'lastname', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'state', label: 'State' },
]

const CONTRIBUTION_SORT_FIELD_OPTIONS = [
    { value: 'firstname', label: 'First Name' },
    { value: 'lastname', label: 'Last Name' },
    { value: 'paid_at', label: 'Paid At' },
]

export default function Page() {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navVal = navParams.get('lineitemId')

    const [selectedLineitemId, setSelectedLineitemId] = useState<number | null>(
        navVal ? +navVal : null
    )
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch('/actblue/contributions', zActBlueDonationPacket, {
        search: { sort: SortDirection.ASC },
    })

    const contributionQuery = useQuery({
        queryKey: [`/actblue/contributions/${selectedLineitemId}`],
        queryFn:
            ready && selectedLineitemId != null
                ? ({ signal }) =>
                      onGet(
                          '/actblue/contributions/:lineitemId',
                          zActBlueDonationPacket,
                          { params: { lineitemId: selectedLineitemId }, signal }
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (navVal == null) {
            return
        }

        const nextSelectedLineitemId = Number(navVal)

        setSelectedLineitemId(
            Number.isFinite(nextSelectedLineitemId)
                ? nextSelectedLineitemId
                : null
        )
    }, [navVal])

    const formatDate = (value: Date) => {
        if (!dateService.isValid(value)) {
            return 'Invalid date'
        }

        return Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
            timeStyle: 'medium',
        }).format(value)
    }

    const makeTitle = (donation: ActBlueDonationPacket) => {
        return `${donation.firstName} ${donation.lastName}`
    }

    const contributions = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count

    return (
        <Panel
            includeSidebar
            largeTitle
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Contributions"
            showScrollbar={false}
            sidebarList={{
                search: { search, onSearch },
                footer: {
                    page: search.page ?? 0,
                    pageSize: search.limit ?? 25,
                    count: resultCount,
                    isPending: searchQuery.isPending,
                    onPageChange: (nextPage: number) =>
                        onSearch({ ...search, page: nextPage }),
                },
                filters: {
                    search,
                    onSearch,
                    searchFieldOptions: CONTRIBUTION_FIELD_OPTIONS,
                    sortFieldOptions: CONTRIBUTION_SORT_FIELD_OPTIONS,
                    showSort: true,
                    showLimit: true,
                },
            }}
            sidebarBody={
                <SidebarBody<ActBlueDonationPacket>
                    items={contributions}
                    isLoading={searchQuery.isPending}
                    error={searchQuery.error}
                    selectedKey={selectedLineitemId}
                    renderItem={(contribution) => ({
                        key: contribution.lineitemId,
                        label: makeTitle(contribution),
                        subtitle: formatDate(contribution.paidAt),
                        tagLabel: contribution.isRecurring
                            ? 'Recurring'
                            : undefined,
                        href: `/volunteer_dashboard/panels/contributions?lineitemId=${contribution.lineitemId}`,
                        onClick: (event) => {
                            event.preventDefault()
                            setSelectedLineitemId(contribution.lineitemId)
                            if (!isDesktop) {
                                setSidebarMobileVisible(false)
                            }
                        },
                    })}
                />
            }
        >
            <div className={styles.detailsPane}>
                {!isDesktop && !sidebarMobileVisible ? (
                    <button
                        className={styles.mobileBackButton}
                        onClick={() => setSidebarMobileVisible(true)}
                        type="button"
                    >
                        Contributions
                    </button>
                ) : null}

                {selectedLineitemId == null && (
                    <div className={styles.emptyState}>
                        No contribution selected
                    </div>
                )}

                {selectedLineitemId != null && contributionQuery.isPending && (
                    <div className={styles.emptyState}>
                        Loading contribution details...
                    </div>
                )}

                {selectedLineitemId != null && contributionQuery.error && (
                    <div
                        className={styles.emptyState}
                        style={{ color: '#ef4444' }}
                    >
                        Error:{' '}
                        {contributionQuery.error instanceof Error
                            ? contributionQuery.error.message
                            : 'Unknown error'}
                    </div>
                )}

                {selectedLineitemId != null && contributionQuery.data && (
                    <Form<ActBlueDonationPacket>
                        key={selectedLineitemId}
                        form={contributionQuery.data}
                        title={makeTitle(contributionQuery.data)}
                        readonly={true}
                        saving={false}
                        isInvalid={false}
                        onUpdate={() => undefined}
                        onSave={() => undefined}
                    >
                        <FormGroup title="Lineitem Info">
                            <TextField label="Lineitem Id" field="lineitemId" />
                            <TextField label="Sequence" field="sequence" />
                            <DateField label="Paid At" field="paidAt" />
                            <TextField label="Amount" field="amount" />
                            <TextField<ActBlueDonationPacket>
                                label="Recurring Amount"
                                getter={(form) =>
                                    form.recurringAmount == null
                                        ? 'N/A'
                                        : `$${form.recurringAmount}`
                                }
                            />
                            <TextField
                                label="Amount Minus Ab Fees"
                                field="amountLessAbFees"
                            />
                        </FormGroup>
                        <FormGroup title="Contribution Info">
                            <TextField
                                label="Order Number"
                                field="orderNumber"
                            />
                            <TextField<ActBlueDonationPacket>
                                label="Is Paypal"
                                getter={(form) => `${form.isPaypal}`}
                            />
                            <TextField<ActBlueDonationPacket>
                                label="Is Mobile"
                                getter={(form) => `${form.isMobile}`}
                            />
                            <TextField<ActBlueDonationPacket>
                                label="Is Express"
                                getter={(form) => `${form.isExpress}`}
                            />
                            <TextField<ActBlueDonationPacket>
                                label="Is Recurring"
                                getter={(form) => `${form.isRecurring}`}
                            />
                            <TextField
                                label="Recurring Period"
                                field="recurringPeriod"
                            />
                            <TextField
                                label="Recurring Duration"
                                field="recurringDuration"
                            />
                        </FormGroup>
                        <FormGroup title="Donor Info">
                            <TextField label="First Name" field="firstName" />
                            <TextField label="Last Name" field="lastName" />
                            <TextField label="State" field="state" />
                            <TextField label="Email" field="email" />
                            <NavigationButton
                                className={styles.detailsNavigationButton}
                                href={`/volunteer_dashboard/panels/donors?email=${encodeURIComponent(contributionQuery.data.email)}`}
                                label="Full Details"
                                trackPanelHistory
                            />
                        </FormGroup>
                        <FormGroup title="Contribution Form">
                            <TextField
                                label="Form Name"
                                field="contributionForm"
                            />
                            <TextField label="Form Kind" field="kind" />
                            {contributionQuery.data?.customFields?.map(
                                (field) => (
                                    <TextField
                                        key={field.id ?? field.label}
                                        label={field.label}
                                        getter={() => field.answer}
                                    />
                                )
                            )}
                        </FormGroup>
                    </Form>
                )}
            </div>
        </Panel>
    )
}
