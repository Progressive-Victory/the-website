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
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import {
    DropdownButton,
    DropdownOverlay,
    ToggleGroup,
} from '@/components/common'
import { CloseCircleIcon } from '@/components/common/icons/CloseCircleIcon'
import Panel from '@/components/common/panel/Panel'
import { Table } from '@/components/common/table'
import { cn, DOT_SEPARATOR } from '@/util'
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

function getUserDisplayName(user: UserProfile): string {
    if (user.preferredName) return user.preferredName

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (fullName) return fullName

    if (user.email) return user.email
    return `User ${user.id}`
}

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

type TableOptionRowConfig = (typeof tableOptionRows)[number]

interface TableOptionRowProps {
    config: TableOptionRowConfig
    value: boolean
    onChange: (value: boolean) => void
}

function TableOptionRow({
    config: { label, ariaLabel, choices },
    value,
    onChange,
}: TableOptionRowProps) {
    return (
        <div className={styles.tableOptionRow}>
            <span className={styles.tableOptionLabel}>{label}</span>
            <ToggleGroup<boolean>
                ariaLabel={ariaLabel}
                orientation="horizontal"
                value={value}
                options={choices}
                onChange={onChange}
            />
        </div>
    )
}

interface TableOptionsMenuProps {
    options: MembershipTableOptions
    setOption: <K extends keyof MembershipTableOptions>(
        key: K,
        value: MembershipTableOptions[K]
    ) => void
    onRestoreDefaults: () => void
}

function TableOptionsMenu({
    options,
    setOption,
    onRestoreDefaults,
}: TableOptionsMenuProps) {
    return (
        <DropdownButton
            buttonVariant="minimal"
            label="Table Options"
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    className={styles.tableOptionsBox}
                    label="Table Options"
                    onClose={closeDropdown}
                    bodyClassName={styles.tableOptionsBody}
                    body={tableOptionRows.map((config) => (
                        <TableOptionRow
                            key={config.key}
                            config={config}
                            value={options[config.key]}
                            onChange={(value) => setOption(config.key, value)}
                        />
                    ))}
                    footerButtonLabel="Restore Defaults"
                    footerButtonClassName={styles.restoreDefaultsButton}
                    footerButtonOnClick={() => {
                        onRestoreDefaults()
                        closeDropdown()
                    }}
                />
            )}
        />
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
        isEditing,
        setIsEditing,
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
                isEditing,
                edit: editController,
                onMatchUser: setMemberToMatch,
                searchQuery: searchDraft,
                searchField,
            }),
        [options, isEditing, editController, searchDraft, searchField]
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

    const renderUserPickerResults = () => {
        const { isPending, error, data } = userSearchQuery
        const results = data?.data ?? []

        const renderContent = () => {
            if (isPending) return 'Loading...'
            if (error) return `Error: ${error.message}`
            if (results.length === 0) return 'No results found'

            return results.map((user) => (
                <button
                    key={user.id}
                    type="button"
                    className={styles.userPickerItem}
                    onClick={() => void handleMatchUser(user)}
                >
                    <span className={styles.userPickerName}>
                        {getUserDisplayName(user)}
                    </span>
                    {user.email && (
                        <span className={styles.userPickerSub}>
                            {user.email}
                        </span>
                    )}
                </button>
            ))
        }

        return (
            <div className={cn(styles.pickerStatus, error && styles.error)}>
                {renderContent()}
            </div>
        )
    }

    return (
        <Panel
            includeHeader
            label="Membership"
            headerRight={
                <div className={styles.panelHeaderRight}>
                    <div className={styles.panelTimestamp}>
                        {eligibleMemberCount != null &&
                            `${eligibleMemberCount.toLocaleString()} Eligible ${DOT_SEPARATOR} `}
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
                                <CloseCircleIcon />
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
                            {isEditing ? (
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
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FaEdit /> Edit
                                </button>
                            )}
                            <TableOptionsMenu
                                options={options}
                                setOption={setOption}
                                onRestoreDefaults={() => {
                                    resetOptions()
                                    resetColumnOrder()
                                }}
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
                                options={{
                                    editing: isEditing,
                                    zebra: options.showZebra,
                                    reorderable: isEditing,
                                    entryOrder: columnOrder,
                                    onEntryOrderChange: onColumnOrderChange,
                                }}
                                isScrollTarget={isSearchMatch}
                                scrollToColumnKey={searchField}
                                scrollToRowToken={scrollToMatchToken}
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
                    {renderUserPickerResults()}
                </SearchModal>
            </div>
        </Panel>
    )
}
