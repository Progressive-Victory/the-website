'use client'

import {
    useLinkDonorToUser,
    useMembershipPanel,
    usePendingUpdates,
    useSaveMemberships,
    useColumnOrder,
    MembershipTableOptions,
} from './hooks'
import { matchesSearchQuery } from './membership.helpers'
import {
    EditController,
    Member,
    MembershipSearchField,
    membershipSearchFields,
} from './membership.types'
import { buildColumns, FULFILLMENT_CATEGORY } from './membershipColumns'
import styles from './page.module.css'
import { ListBody, ListElement } from '@/app/admin/layout/List'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import {
    DropdownButton,
    DropdownOverlay,
    ToggleGroup,
} from '@/components/common'
import Panel from '@/components/common/panel/Panel'
import { Table } from '@/components/common/table'
import { cn } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
import { UserProfile, zUserProfile } from 'pv-contracts/data'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'

const showHideChoices = [
    { value: true, label: 'Show' },
    { value: false, label: 'Hide' },
]

const tableOptionRows: {
    key: keyof MembershipTableOptions
    label: string
    ariaLabel: string
    choices: { value: boolean; label: string }[]
}[] = [
    {
        key: 'showRowNumber',
        label: 'Row column',
        ariaLabel: 'Row Column',
        choices: showHideChoices,
    },
    {
        key: 'showStatus',
        label: 'Status columns',
        ariaLabel: 'Member Eligibility Columns',
        choices: showHideChoices,
    },
    {
        key: 'showConfirmed',
        label: 'Confirmed columns',
        ariaLabel: 'Member Details Confirmed Columns',
        choices: showHideChoices,
    },
    {
        key: 'showFulfilled',
        label: 'Benefits fulfilled tag',
        ariaLabel: 'Tag Groups',
        choices: showHideChoices,
    },
    {
        key: 'showZebra',
        label: 'Zebra striping',
        ariaLabel: 'Zebra Striping',
        choices: showHideChoices,
    },
    {
        key: 'collapseFulfillment',
        label: 'Fulfillment columns',
        ariaLabel: 'Fulfillment columns',
        choices: [
            { value: false, label: 'Expand' },
            { value: true, label: 'Collapse' },
        ],
    },
]

function EditToolbar({
    members,
    editController,
    saveMutation,
    discardEdits,
}: {
    members: Member[]
    editController: EditController
    saveMutation: ReturnType<typeof useSaveMemberships>
    discardEdits: () => void
}) {
    const { pendingUpdates, hasInvalidEdits } = usePendingUpdates(
        editController,
        members
    )

    return (
        <>
            <span className={styles.editStatus}>
                {hasInvalidEdits
                    ? 'Fix invalid fields to save'
                    : pendingUpdates.length === 0
                      ? 'No changes'
                      : `${pendingUpdates.length} pending change${pendingUpdates.length === 1 ? '' : 's'}`}
            </span>
            <button
                type="button"
                className={styles.toolbarButton}
                disabled={
                    hasInvalidEdits ||
                    pendingUpdates.length === 0 ||
                    saveMutation.isPending
                }
                onClick={() => saveMutation.mutate(pendingUpdates)}
            >
                <FaSave /> {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button
                type="button"
                className={cn(styles.toolbarButton, styles.discardButton)}
                disabled={saveMutation.isPending}
                onClick={discardEdits}
            >
                <FaTrashAlt /> Discard Changes
            </button>
        </>
    )
}

export default function Page() {
    const [memberToMatch, setMemberToMatch] = useState<Member | null>(null)
    // not wired to the query yet
    const [searchDraft, setSearchDraft] = useState('')
    const [searchField, setSearchField] =
        useState<MembershipSearchField>('name')
    const [scrollToMatchToken, setScrollToMatchToken] = useState(0)
    const { columnOrder, onColumnOrderChange, resetColumnOrder } =
        useColumnOrder()
    const linkMutation = useLinkDonorToUser()
    const {
        members,
        totalEntries,
        eligibleMemberCount,
        options,
        setOption,
        resetOptions,
        tableMode,
        setTableMode,
        editController,
        saveMutation,
        discardEdits,
        hasNextPage,
        isFetchingNextPage,
        sentinelRef,
        isPending,
        error,
        refetch,
    } = useMembershipPanel()

    const {
        query: userSearchQuery,
        search: userSearch,
        onSearch: onUserSearch,
    } = usePaginatedSearch('/users', zUserProfile)

    const handleMatchUser = useCallback(
        async (user: UserProfile) => {
            const donorEmail = memberToMatch?.donorEmail
            if (donorEmail == null) return

            await linkMutation.mutateAsync({ donorEmail, userId: user.id })
            setMemberToMatch(null)
        },
        [linkMutation, memberToMatch?.donorEmail]
    )

    const handleUserSearch = useCallback(
        (event: ChangeEvent<HTMLInputElement>) =>
            onUserSearch({
                ...userSearch,
                query: event.target.value,
                page: 0,
            }),
        [onUserSearch, userSearch]
    )

    const columns = useMemo(
        () =>
            buildColumns({
                options,
                tableMode,
                edit: editController,
                onMatchUser: setMemberToMatch,
                searchQuery: searchDraft,
                searchField,
            }),
        [options, tableMode, editController, searchDraft, searchField]
    )

    const collapsedCategories = useMemo(
        () => (options.collapseFulfillment ? [FULFILLMENT_CATEGORY] : []),
        [options.collapseFulfillment]
    )

    const isSearchMatch = useCallback(
        (member: Member) =>
            matchesSearchQuery(
                member,
                searchDraft.trim().toLowerCase(),
                searchField
            ),
        [searchDraft, searchField]
    )

    const matchCount = useMemo(
        () => members.filter(isSearchMatch).length,
        [members, isSearchMatch]
    )

    return (
        <Panel
            includeHeader
            label="Membership"
            headerRight={
                <div className={styles.panelHeaderRight}>
                    <div className={styles.panelTimestamp}>
                        {eligibleMemberCount != null &&
                            `${eligibleMemberCount.toLocaleString()} Eligible · `}
                        Showing {members.length.toLocaleString()}
                        {totalEntries != null &&
                            ` of ${totalEntries.toLocaleString()}`}
                    </div>
                    <div className={styles.panelSearch}>
                        <FiSearch
                            className={styles.panelSearchIcon}
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            className={styles.panelSearchInput}
                            placeholder="Search..."
                            aria-label="Search memberships"
                            value={searchDraft}
                            onChange={(event) =>
                                setSearchDraft(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key !== 'Enter' || matchCount === 0)
                                    return
                                event.preventDefault()
                                setScrollToMatchToken((token) => token + 1)
                            }}
                        />
                        {searchDraft.trim() !== '' && (
                            <span className={styles.panelSearchCount}>
                                {matchCount.toLocaleString()}
                            </span>
                        )}
                        {searchDraft !== '' ? (
                            <button
                                type="button"
                                className={styles.panelSearchClear}
                                aria-label="Clear search"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => setSearchDraft('')}
                            >
                                <svg viewBox="0 0 16 16" aria-hidden="true">
                                    <circle cx="8" cy="8" r="8" />
                                    <path d="M5.5 5.5l5 5m0-5l-5 5" />
                                </svg>
                            </button>
                        ) : (
                            <span className={styles.panelSearchFilter}>
                                <IoMdOptions aria-hidden="true" />
                                <select
                                    className={styles.panelSearchFilterSelect}
                                    aria-label="Search column"
                                    value={searchField}
                                    onChange={(event) =>
                                        setSearchField(
                                            event.target
                                                .value as MembershipSearchField
                                        )
                                    }
                                >
                                    {membershipSearchFields.map((field) => (
                                        <option
                                            key={field.value}
                                            value={field.value}
                                        >
                                            {field.label}
                                        </option>
                                    ))}
                                </select>
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <div className={styles.panelContents}>
                <div className={styles.scrollView}>
                    <div className={styles.galleryHeader}>
                        <div className={styles.galleryHeading}>
                            <h1 className={styles.galleryTitle}>Membership</h1>
                            <p className={styles.gallerySubTitle}>
                                Manage membership records and details.
                            </p>
                        </div>

                        <div className={styles.tableToolbar}>
                            {tableMode === 'edit' ? (
                                <EditToolbar
                                    members={members}
                                    editController={editController}
                                    saveMutation={saveMutation}
                                    discardEdits={discardEdits}
                                />
                            ) : (
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    onClick={() => setTableMode('edit')}
                                >
                                    <FaEdit /> Edit
                                </button>
                            )}
                            <DropdownButton
                                buttonVariant="minimal"
                                label="Table Options"
                                menu={({ closeDropdown }) => (
                                    <DropdownOverlay
                                        className={styles.tableOptionsBox}
                                        label="Table Options"
                                        onClose={closeDropdown}
                                        bodyClassName={styles.tableOptionsBody}
                                        body={tableOptionRows.map(
                                            ({
                                                key,
                                                label,
                                                ariaLabel,
                                                choices,
                                            }) => (
                                                <div
                                                    key={key}
                                                    className={
                                                        styles.tableOptionRow
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.tableOptionLabel
                                                        }
                                                    >
                                                        {label}
                                                    </span>
                                                    <ToggleGroup<boolean>
                                                        ariaLabel={ariaLabel}
                                                        orientation="horizontal"
                                                        value={options[key]}
                                                        options={choices}
                                                        onChange={(value) =>
                                                            setOption(
                                                                key,
                                                                value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}
                                        footerButtonLabel="Restore Defaults"
                                        footerButtonClassName={
                                            styles.restoreDefaultsButton
                                        }
                                        footerButtonOnClick={() => {
                                            resetOptions()
                                            resetColumnOrder()
                                            closeDropdown()
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        {error ? (
                            <div className={styles.tableStatus} role="alert">
                                <p className={styles.tableStatusTitle}>
                                    Could not load membership records.
                                </p>
                                <p className={styles.tableStatusDetail}>
                                    {error.message}
                                </p>
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    onClick={refetch}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : isPending ? (
                            <div className={styles.tableStatus}>
                                Loading membership records...
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                data={members}
                                rowKey={(m) => m.id}
                                collapsedCategories={collapsedCategories}
                                mode={tableMode}
                                zebra={options.showZebra}
                                isScrollTarget={isSearchMatch}
                                scrollToColumnKey={searchField}
                                scrollToRowToken={scrollToMatchToken}
                                reorderable={tableMode === 'edit'}
                                entryOrder={columnOrder}
                                onEntryOrderChange={onColumnOrderChange}
                                footer={
                                    hasNextPage && (
                                        <div
                                            className={styles.loadMore}
                                            ref={sentinelRef}
                                        >
                                            {isFetchingNextPage &&
                                                'Loading more membership records...'}
                                        </div>
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
                <SearchModal
                    open={memberToMatch != null}
                    onClose={() => setMemberToMatch(null)}
                    title="Match User"
                    subtitle="Search users and link one to this membership record."
                    searchValue={userSearch.query ?? ''}
                    onSearchChange={handleUserSearch}
                >
                    <ListBody
                        count={userSearchQuery.data?.count}
                        isPending={userSearchQuery.isPending}
                        error={userSearchQuery.error}
                    >
                        {userSearchQuery.data?.data.map((user) => (
                            <ListElement
                                key={user.id}
                                onClick={() => void handleMatchUser(user)}
                            >
                                <span>
                                    {user.preferredName ??
                                        [user.firstName, user.lastName]
                                            .filter(Boolean)
                                            .join(' ') ??
                                        user.email ??
                                        `User ${user.id}`}
                                </span>
                                {user.email && <span>{user.email}</span>}
                            </ListElement>
                        ))}
                    </ListBody>
                </SearchModal>
            </div>
        </Panel>
    )
}
