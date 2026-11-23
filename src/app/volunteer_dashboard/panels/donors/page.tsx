'use client'

import { donorDetailLists } from './donorDetails'
import styles from './page.module.css'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import { FormState, Form } from '@/components/common/forms'
import Panel from '@/components/common/panel/Panel'
import { ProtectedPanel } from '@/components/common/panel/ProtectedPanel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import {
    SidebarListFilters,
    type SidebarListFiltersProps,
} from '@/components/common/panel/sidebar_list/SidebarList'
import { PermissionIds } from '@/models'
import { cn, parseErrorMessage } from '@/util'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { ActBlueDonor, zActBlueDonor } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useEffect, useState } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'
import { useMediaQuery } from 'usehooks-ts'

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
    } = usePaginatedSearch('/actblue/donors', zActBlueDonor, {
        search: { sort: SortDirection.ASC },
    })

    const donorQuery = useQuery({
        queryKey: [`/actblue/donors/${selectedEmail}`],
        queryFn:
            ready && selectedEmail != null
                ? ({ signal }) =>
                      onGet('/actblue/donors/:donorEmail', zActBlueDonor, {
                          params: { donorEmail: selectedEmail },
                          signal,
                      })
                : skipToken,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        setSelectedEmail(navEmail)
    }, [navEmail])

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

    const donors = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count
    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        searchFieldOptions: DONOR_FIELD_OPTIONS,
        sortFieldOptions: DONOR_SORT_FIELD_OPTIONS,
        showSort: true,
        showLimit: true,
    }

    return (
        <ProtectedPanel
            label="Donors"
            requiredPermissions={[PermissionIds.VIEW_DONORS_PANEL]}
        >
            <Panel
                includeSidebar
                largeTitle
                sidebarWidth="24rem"
                sidebarClassName={styles.sidebarBg}
                sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                label="Donors"
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
                    <SidebarBody<ActBlueDonor>
                        items={donors}
                        isLoading={searchQuery.isPending}
                        error={searchQuery.error}
                        selectedKey={selectedEmail}
                        renderItem={(donor) => ({
                            key: donor.email,
                            label: makeTitle(donor),
                            href: `/volunteer_dashboard/panels/donors?email=${donor.email}`,
                            onClick: (event) => {
                                event.preventDefault()
                                handleSelectItem(donor)
                                if (!isDesktop) {
                                    setSidebarMobileVisible(false)
                                }
                            },
                        })}
                    />
                }
            >
                <div className={styles.detailPane}>
                    <MobileSidebarBackButton
                        label="Donors"
                        sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                        onBack={() => setSidebarMobileVisible(true)}
                    />
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
                            className={cn(styles.emptyState, styles.errorState)}
                        >
                            Error: {parseErrorMessage(donorQuery.error)}
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
                            {donorDetailLists(donorQuery.data)}
                        </Form>
                    )}
                </div>
            </Panel>
        </ProtectedPanel>
    )
}
