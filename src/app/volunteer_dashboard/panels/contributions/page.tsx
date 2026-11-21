'use client'

import styles from './page.module.css'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import {
    List,
    ListBreak,
    ListRow,
    LongTextRow,
    NameRow,
    NavigationRow,
} from '@/components/common'
import { Form } from '@/components/common/forms'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import {
    SidebarListFilters,
    type SidebarListFiltersProps,
} from '@/components/common/panel/sidebar_list/SidebarList'
import { dateService } from '@/services'
import { cn, parseErrorMessage } from '@/util'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import {
    ActBlueDonationPacket,
    zActBlueDonationPacket,
} from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useEffect, useState } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'
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

const dollarFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

const formatDollars = (amount: number) => dollarFormat.format(amount)

const yesNo = (value: boolean) => (value ? 'Yes' : 'No')

const formatDate = (value: Date) =>
    dateService.isValid(value)
        ? Intl.DateTimeFormat('en-US', {
              dateStyle: 'long',
              timeStyle: 'medium',
          }).format(value)
        : 'Invalid date'

// Returns the lists as an array so the parent Form can hydrate each one directly.
const contributionDetailLists = (contribution: ActBlueDonationPacket) => [
    <List key="lineitem" title="Lineitem Info">
        <ListRow label="Amount" value={formatDollars(contribution.amount)} />
        <ListRow
            label="Amount Less AB Fees"
            value={formatDollars(contribution.amountLessAbFees)}
        />
        <ListRow
            label="Recurring Amount"
            value={
                contribution.recurringAmount != null &&
                formatDollars(contribution.recurringAmount)
            }
        />
        <ListBreak />
        <ListRow label="Paid At" value={formatDate(contribution.paidAt)} />
        <ListRow label="Sequence" value={contribution.sequence} />
        <ListRow label="Lineitem ID" value={contribution.lineitemId} />
    </List>,

    <List key="contribution" title="Contribution Info">
        <ListRow label="Order Number" value={contribution.orderNumber} />
        <ListBreak />
        <ListRow label="Recurring" value={yesNo(contribution.isRecurring)} />
        <ListRow
            label="Recurring Period"
            value={contribution.recurringPeriod}
        />
        <ListRow
            label="Recurring Duration"
            value={contribution.recurringDuration}
        />
        <ListBreak />
        <ListRow label="PayPal" value={yesNo(contribution.isPaypal)} />
        <ListRow label="Mobile" value={yesNo(contribution.isMobile)} />
        <ListRow label="Express" value={yesNo(contribution.isExpress)} />
    </List>,

    <List key="donor" title="Donor Info">
        <NameRow
            label="Name"
            readOnly
            value={{
                firstName: contribution.firstName,
                lastName: contribution.lastName,
            }}
        />
        <ListRow label="Email" value={contribution.email} />
        <ListRow label="State" value={contribution.state} />
        <ListBreak />
        <NavigationRow
            label="Open in Donors Panel"
            href={`/volunteer_dashboard/panels/donors?email=${encodeURIComponent(contribution.email)}`}
        />
    </List>,

    <List key="form" title="Contribution Form">
        <ListRow label="Form Name" value={contribution.contributionForm} />
        <LongTextRow
            label="Custom Contact Field"
            readOnly
            value={contribution.customFields?.[0]?.answer}
        />
        <ListRow label="Form Kind" value={contribution.kind} />
    </List>,
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
        search: { sort: SortDirection.DESC },
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

    const makeTitle = (donation: ActBlueDonationPacket) => {
        return `${donation.firstName} ${donation.lastName}`
    }

    const contributions = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count
    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        searchFieldOptions: CONTRIBUTION_FIELD_OPTIONS,
        sortFieldOptions: CONTRIBUTION_SORT_FIELD_OPTIONS,
        showSort: true,
        showLimit: true,
    }

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
                filters: sidebarFilters,
            }}
            prominentHeaderButton={{
                icon: <IoEllipsisVertical size={20} />,
                menu: () => <SidebarListFilters {...sidebarFilters} />,
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
                <MobileSidebarBackButton
                    label="Contributions"
                    sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                    onBack={() => setSidebarMobileVisible(true)}
                />

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
                    <div className={cn(styles.emptyState, styles.errorState)}>
                        Error: {parseErrorMessage(contributionQuery.error)}
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
                        {contributionDetailLists(contributionQuery.data)}
                    </Form>
                )}
            </div>
        </Panel>
    )
}
