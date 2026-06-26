'use client'

import styles from './page.module.css'
import {
    DateField,
    Form,
    FormGroup,
    TextField,
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
import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { dateService } from '@/services'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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

    const initialLineitemId = navVal ? Number(navVal) : null
    const [selectedLineitemId, setSelectedLineitemId] = useState<number | null>(
        Number.isFinite(initialLineitemId) ? initialLineitemId! : null
    )
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<ActBlueDonationPacket>(
        '/actblue/contributions',
        zActBlueDonationPacket
    )

    const contributionQuery = useQuery({
        queryKey: [`/actblue/contributions/${selectedLineitemId}`],
        queryFn:
            ready && selectedLineitemId != null
                ? async () =>
                      onGet<ActBlueDonationPacket>(
                          `/actblue/contributions/${selectedLineitemId}`,
                          zActBlueDonationPacket
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

    const makeTitle = (contribution: ActBlueDonationPacket) => {
        return `${contribution.firstName} ${contribution.lastName}`
    }

    const contributions = searchQuery.data?.data ?? []
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
                            <Sidebar.Title large>Contributions</Sidebar.Title>
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
                                        searchFieldOptions={
                                            CONTRIBUTION_FIELD_OPTIONS
                                        }
                                        sortFieldOptions={
                                            CONTRIBUTION_SORT_FIELD_OPTIONS
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
                            ) : contributions.length === 0 ? (
                                <div className={styles.sidebarState}>
                                    No items found
                                </div>
                            ) : (
                                contributions.map((contribution) => (
                                    <Nav.Item
                                        key={contribution.lineitemId}
                                        active={
                                            selectedLineitemId ===
                                            contribution.lineitemId
                                        }
                                        href={`/admin/panels/contributions?lineitemId=${contribution.lineitemId}`}
                                        label={makeTitle(contribution)}
                                        subtitle={formatDate(
                                            contribution.paidAt
                                        )}
                                        tagLabel={
                                            contribution.isRecurring
                                                ? 'Recurring'
                                                : undefined
                                        }
                                        showIndicator={false}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            setSelectedLineitemId(
                                                contribution.lineitemId
                                            )
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
                            <div className={styles.detailsPane}>
                                {!isDesktop && !sidebarMobileVisible ? (
                                    <button
                                        className={styles.mobileBackButton}
                                        onClick={() =>
                                            setSidebarMobileVisible(true)
                                        }
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

                                {selectedLineitemId != null &&
                                    contributionQuery.isPending && (
                                        <div className={styles.emptyState}>
                                            Loading contribution details...
                                        </div>
                                    )}

                                {selectedLineitemId != null &&
                                    contributionQuery.error && (
                                        <div
                                            className={styles.emptyState}
                                            style={{ color: '#ef4444' }}
                                        >
                                            Error:{' '}
                                            {contributionQuery.error instanceof
                                            Error
                                                ? contributionQuery.error
                                                      .message
                                                : 'Unknown error'}
                                        </div>
                                    )}

                                {selectedLineitemId != null &&
                                    contributionQuery.data && (
                                        <Form<ActBlueDonationPacket>
                                            key={selectedLineitemId}
                                            form={contributionQuery.data}
                                            title={makeTitle(
                                                contributionQuery.data
                                            )}
                                            readonly={true}
                                            saving={false}
                                            isInvalid={false}
                                            onUpdate={() => undefined}
                                            onSave={() => undefined}
                                        >
                                            <FormGroup title="Lineitem Info">
                                                <TextField
                                                    label="Lineitem Id"
                                                    field="lineitemId"
                                                />
                                                <TextField
                                                    label="Sequence"
                                                    field="sequence"
                                                />
                                                <DateField
                                                    label="Paid At"
                                                    field="paidAt"
                                                />
                                                <TextField
                                                    label="Amount"
                                                    field="amount"
                                                />
                                                <TextField<ActBlueDonationPacket>
                                                    label="Recurring Amount"
                                                    getter={(form) =>
                                                        form.recurringAmount ==
                                                        null
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
                                                    getter={(form) =>
                                                        `${form.isPaypal}`
                                                    }
                                                />
                                                <TextField<ActBlueDonationPacket>
                                                    label="Is Mobile"
                                                    getter={(form) =>
                                                        `${form.isMobile}`
                                                    }
                                                />
                                                <TextField<ActBlueDonationPacket>
                                                    label="Is Express"
                                                    getter={(form) =>
                                                        `${form.isExpress}`
                                                    }
                                                />
                                                <TextField<ActBlueDonationPacket>
                                                    label="Is Recurring"
                                                    getter={(form) =>
                                                        `${form.isRecurring}`
                                                    }
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
                                                <TextField
                                                    label="First Name"
                                                    field="firstName"
                                                />
                                                <TextField
                                                    label="Last Name"
                                                    field="lastName"
                                                />
                                                <TextField
                                                    label="State"
                                                    field="state"
                                                />
                                                <TextField
                                                    label="Email"
                                                    field="email"
                                                />
                                                <div
                                                    className={
                                                        styles.detailsNavigationButton
                                                    }
                                                >
                                                    <Link
                                                        href={`/admin/panels/donors?email=${encodeURIComponent(contributionQuery.data.email)}`}
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
                                            <FormGroup title="Contribution Form">
                                                <TextField
                                                    label="Form Name"
                                                    field="contributionForm"
                                                />
                                                <TextField
                                                    label="Form Kind"
                                                    field="kind"
                                                />
                                                {contributionQuery.data?.customFields?.map(
                                                    (field) => (
                                                        <TextField
                                                            key={
                                                                field.id ??
                                                                field.label
                                                            }
                                                            label={field.label}
                                                            getter={() =>
                                                                field.answer
                                                            }
                                                        />
                                                    )
                                                )}
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
