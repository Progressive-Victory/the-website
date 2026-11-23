'use client'

import {
    useMembershipPanel,
    usePendingUpdates,
    useSaveMemberships,
    useColumnOrder,
    ActivityFilter,
    BooleanTableOption,
    EligibilityFilter,
    MembershipTableOptions,
    MatchedFilter,
    TierFilter,
} from './hooks'
import { matchesSearchQuery } from './membership.helpers'
import {
    ChangeTarget,
    EditController,
    Member,
    MembershipSearchField,
    membershipSearchColumns,
    membershipSearchFields,
    PendingUpdate,
} from './membership.types'
import {
    buildColumns,
    changedColumnKeys,
    FULFILLMENT_CATEGORY,
} from './membershipColumns'
import styles from './page.module.css'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import {
    DropdownButton,
    DropdownOverlay,
    DropdownOverlayButton,
    SearchBar,
    ToggleGroup,
} from '@/components/common'
import Panel from '@/components/common/panel/Panel'
import { Table } from '@/components/common/table'
import { DONOR_LINK_MUTATION_KEY, useLinkDonorToUser } from '@/queries'
import { cn, DOT_SEPARATOR } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
import { useIsMutating } from '@tanstack/react-query'
import { UserProfile, zUserProfile } from 'pv-contracts/data'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import {
    FaChevronDown,
    FaChevronUp,
    FaCog,
    FaEdit,
    FaSave,
    FaTrashAlt,
} from 'react-icons/fa'

const showHideChoices = [
    { value: true, label: 'Show' },
    { value: false, label: 'Hide' },
]

const enabledDisabledChoices = [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
]

function estimatePlaceholderRows(
    hasNextPage: boolean,
    totalEntries: number | undefined,
    loadedCount: number,
    visibleCount: number
) {
    if (!hasNextPage || totalEntries == null || loadedCount === 0) return 0
    const remaining = Math.max(0, totalEntries - loadedCount)
    return Math.max(1, Math.round((remaining * visibleCount) / loadedCount))
}

function getUserDisplayName(user: UserProfile): string {
    if (user.preferredName) return user.preferredName

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (fullName) return fullName

    if (user.email) return user.email
    return `User ${user.id}`
}

interface TableOptionRowConfig<T extends boolean | string> {
    label: string
    ariaLabel: string
    choices: { value: T; label: string }[]
}

const tableOptionRows: (TableOptionRowConfig<boolean> & {
    key: BooleanTableOption
})[] = [
    {
        key: 'showRowNumber',
        label: 'Row column',
        ariaLabel: 'Row Column',
        choices: showHideChoices,
    },
    {
        key: 'showZebra',
        label: 'Alternating Rows',
        ariaLabel: 'Alternating Row Color',
        choices: enabledDisabledChoices,
    },
    {
        key: 'showConfirmed',
        label: 'Confirmed columns',
        ariaLabel: 'Member Details Confirmed Columns',
        choices: showHideChoices,
    },
    {
        key: 'showFulfilled',
        label: 'Benefits Fulfilled Bar',
        ariaLabel: 'Tag Groups',
        choices: enabledDisabledChoices,
    },
    {
        key: 'showStatus',
        label: 'Status columns',
        ariaLabel: 'Member Eligibility Columns',
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

const eligibilityOptionRow: TableOptionRowConfig<EligibilityFilter> = {
    label: 'Eligibility',
    ariaLabel: 'Eligibility Filter',
    choices: [
        { value: 'both', label: 'Both' },
        { value: 'eligible', label: 'Eligible' },
        { value: 'ineligible', label: 'Ineligible' },
    ],
}

// # TODO Upon API being updated to include ActBlue Cancellations and Refunds Webhooks Replace Activity Toggle with a Members Toggle
const activityOptionRow: TableOptionRowConfig<ActivityFilter> = {
    label: 'Membership Status',
    ariaLabel: 'Membership Status Filter',
    choices: [
        { value: 'both', label: 'Both' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ],
}

const tierOptionRow: TableOptionRowConfig<TierFilter> = {
    label: 'Tier',
    ariaLabel: 'Tier Filter',
    choices: [
        { value: 'all', label: 'All' },
        { value: 'Dues Paying Member', label: 'Dues' },
        { value: 'Premium Member', label: 'Premium' },
        { value: 'Signature Member', label: 'Signature' },
        { value: 'Inner Circle Member', label: 'Inner Circle' },
        { value: 'none', label: 'None' },
    ],
}

const matchedOptionRow: TableOptionRowConfig<MatchedFilter> = {
    label: 'User Matched',
    ariaLabel: 'User Matched Filter',
    choices: [
        { value: 'both', label: 'Both' },
        { value: 'matched', label: 'Matched' },
        { value: 'unmatched', label: 'Unmatched' },
    ],
}

function EditToolbar({
    members,
    editController,
    saveMutation,
    discardEdits,
    onNavigateToChange,
}: {
    members: Member[]
    editController: EditController
    saveMutation: ReturnType<typeof useSaveMemberships>
    discardEdits: () => void
    onNavigateToChange: (update: PendingUpdate) => void
}) {
    const { pendingUpdates, hasInvalidEdits } = usePendingUpdates(
        editController,
        members
    )
    const [currentChange, setCurrentChange] = useState<string | null>(null)

    const changedUpdates = useMemo(() => {
        const byEmail = new Map(pendingUpdates.map((u) => [u.donorEmail, u]))
        return members.flatMap(
            ({ donorEmail }) => byEmail.get(donorEmail ?? '') ?? []
        )
    }, [members, pendingUpdates])

    const navigateToChange = (step: 1 | -1) => {
        const count = changedUpdates.length
        const index = changedUpdates.findIndex(
            (update) => update.donorEmail === currentChange
        )
        const base = index === -1 && step === -1 ? 0 : index
        const next = changedUpdates[(((base + step) % count) + count) % count]
        setCurrentChange(next.donorEmail)
        onNavigateToChange(next)
    }

    return (
        <>
            <span className={styles.editStatus}>
                {hasInvalidEdits
                    ? 'Fix invalid fields to save'
                    : pendingUpdates.length === 0
                      ? 'No changes'
                      : `${pendingUpdates.length} pending change${pendingUpdates.length === 1 ? '' : 's'}`}
            </span>
            {changedUpdates.length > 0 && (
                <span className={styles.changeNav}>
                    <button
                        type="button"
                        className={styles.changeNavButton}
                        aria-label="Previous change"
                        onClick={() => navigateToChange(-1)}
                    >
                        <FaChevronUp />
                    </button>
                    <button
                        type="button"
                        className={styles.changeNavButton}
                        aria-label="Next change"
                        onClick={() => navigateToChange(1)}
                    >
                        <FaChevronDown />
                    </button>
                </span>
            )}
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

interface TableOptionRowProps<T extends boolean | string> {
    config: TableOptionRowConfig<T>
    value: T
    onChange: (value: T) => void
    className?: string
}

function TableOptionRow<T extends boolean | string>({
    config: { label, ariaLabel, choices },
    value,
    onChange,
    className,
}: TableOptionRowProps<T>) {
    return (
        <div className={cn(styles.tableOptionRow, className)}>
            <span className={styles.tableOptionLabel}>{label}</span>
            <ToggleGroup<T>
                ariaLabel={ariaLabel}
                orientation="horizontal"
                value={value}
                options={choices}
                onChange={onChange}
            />
        </div>
    )
}

function MembershipCounts({
    activeCount,
    eligibleCount,
    showingCount,
    totalCount,
}: {
    activeCount?: number
    eligibleCount?: number
    showingCount: number
    totalCount?: number
}) {
    return (
        <div className={styles.panelTimestamp}>
            {activeCount != null &&
                `${activeCount.toLocaleString()} Active ${DOT_SEPARATOR} `}
            {eligibleCount != null &&
                `${eligibleCount.toLocaleString()} Eligible ${DOT_SEPARATOR} `}
            Showing {showingCount.toLocaleString()}
            {totalCount != null && ` of ${totalCount.toLocaleString()}`}
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
                    body={
                        <>
                            <TableOptionRow
                                config={eligibilityOptionRow}
                                value={options.eligibility}
                                onChange={(value) =>
                                    setOption('eligibility', value)
                                }
                            />
                            <TableOptionRow
                                config={activityOptionRow}
                                value={options.activity}
                                onChange={(value) =>
                                    setOption('activity', value)
                                }
                            />
                            <TableOptionRow
                                config={tierOptionRow}
                                value={options.tier}
                                onChange={(value) => setOption('tier', value)}
                                className={styles.tableOptionRowWide}
                            />
                            <TableOptionRow
                                config={matchedOptionRow}
                                value={options.matched}
                                onChange={(value) =>
                                    setOption('matched', value)
                                }
                            />
                            {tableOptionRows.map((config) => (
                                <TableOptionRow
                                    key={config.key}
                                    config={config}
                                    value={options[config.key]}
                                    onChange={(value) =>
                                        setOption(config.key, value)
                                    }
                                />
                            ))}
                        </>
                    }
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
    const [searchField, setSearchField] = useState<MembershipSearchField>('all')
    const [scrollToMatchToken, setScrollToMatchToken] = useState(0)
    const [changeTarget, setChangeTarget] = useState<ChangeTarget | null>(null)
    const { columnOrder, onColumnOrderChange, resetColumnOrder } =
        useColumnOrder()
    const linkMutation = useLinkDonorToUser('Membership Panel')
    const isLinking =
        useIsMutating({ mutationKey: DONOR_LINK_MUTATION_KEY }) > 0
    const {
        members,
        totalEntries,
        eligibleMemberCount,
        options,
        setOption,
        resetOptions,
        isEditing,
        isSaving,
        setIsEditing,
        editController,
        saveMutation,
        discardEdits,
        hasNextPage,
        loadMore,
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
        (user: UserProfile) => {
            const donor = memberToMatch?.packet.donor
            if (donor == null) return

            linkMutation.mutate(
                { donor, userId: user.id },
                { onSuccess: () => setMemberToMatch(null) }
            )
        },
        [linkMutation, memberToMatch]
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
                changeTarget: isEditing ? changeTarget : null,
            }),
        [
            options,
            isEditing,
            editController,
            searchDraft,
            searchField,
            changeTarget,
        ]
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

    const visibleMembers = useMemo(
        () =>
            members.filter((member) => {
                const activity = member.isActive ? 'active' : 'inactive'
                const tier = member.recurringSummary?.tier ?? 'none'
                const matched = member.userMatched ? 'matched' : 'unmatched'
                return (
                    ['both', activity].includes(options.activity) &&
                    ['all', tier].includes(options.tier) &&
                    ['both', matched].includes(options.matched)
                )
            }),
        [members, options.activity, options.tier, options.matched]
    )

    const matchCount = useMemo(
        () => visibleMembers.filter(isSearchMatch).length,
        [visibleMembers, isSearchMatch]
    )

    const activeMemberCount = useMemo(
        () => members.filter((member) => member.isActive).length,
        [members]
    )

    const searchColumnKeys = useMemo(() => {
        if (searchField !== 'all') return searchField
        const query = searchDraft.trim().toLowerCase()
        const match = visibleMembers.find(isSearchMatch)
        return membershipSearchColumns.filter(
            (column) => match && matchesSearchQuery(match, query, column)
        )
    }, [visibleMembers, isSearchMatch, searchDraft, searchField])

    const isScrollTarget = useMemo(
        () =>
            changeTarget == null
                ? isSearchMatch
                : (member: Member) =>
                      member.donorEmail === changeTarget.donorEmail,
        [changeTarget, isSearchMatch]
    )

    const navigateToChange = useCallback((update: PendingUpdate) => {
        setChangeTarget({
            donorEmail: update.donorEmail,
            columnKeys: changedColumnKeys(update),
        })
        setScrollToMatchToken((token) => token + 1)
    }, [])

    const renderUserPickerResults = () => {
        const { isPending, error, data } = userSearchQuery
        const results = data?.data ?? []
        const linkingUserId =
            linkMutation.isPending && linkMutation.variables.userId

        const renderContent = () => {
            if (isPending) return 'Loading...'
            if (error) return `Error: ${error.message}`
            if (results.length === 0) return 'No results found'

            return results.map((user) => (
                <button
                    key={user.id}
                    type="button"
                    className={cn(
                        styles.userPickerItem,
                        user.id === linkingUserId && styles.linking
                    )}
                    disabled={linkMutation.isPending}
                    onClick={() => handleMatchUser(user)}
                >
                    <span className={styles.userPickerName}>
                        {getUserDisplayName(user)}
                    </span>
                    {user.email && (
                        <span className={styles.userPickerSub}>
                            {user.email}
                        </span>
                    )}
                    {user.id === linkingUserId && (
                        <span className={styles.userPickerLinking}>
                            <FaCog className={styles.savingSpinner} />
                            Matching user…
                        </span>
                    )}
                </button>
            ))
        }

        return (
            <div className={cn(styles.pickerStatus, error && styles.error)}>
                {linkMutation.error && (
                    <div className={styles.matchError} role="alert">
                        Could not match user: {linkMutation.error.message}
                    </div>
                )}
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
                    <MembershipCounts
                        activeCount={isPending ? undefined : activeMemberCount}
                        eligibleCount={eligibleMemberCount}
                        showingCount={visibleMembers.length}
                        totalCount={
                            options.activity === 'both' &&
                            options.tier === 'all' &&
                            options.matched === 'both'
                                ? totalEntries
                                : undefined
                        }
                    />
                    <SearchBar
                        placeholder="Search..."
                        searchbarStyle="pill"
                        aria-label="Search memberships"
                        value={searchDraft}
                        resultCount={matchCount}
                        onChange={(event) => setSearchDraft(event.target.value)}
                        onClear={() => setSearchDraft('')}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter' || matchCount === 0)
                                return
                            event.preventDefault()
                            setChangeTarget(null)
                            setScrollToMatchToken((token) => token + 1)
                        }}
                        filterLabel="Search column"
                        filterContent={({ close }) =>
                            membershipSearchFields.map((field) => (
                                <DropdownOverlayButton
                                    key={field.value}
                                    selected={searchField === field.value}
                                    onClick={() => {
                                        setSearchField(field.value)
                                        close()
                                    }}
                                >
                                    {field.label}
                                </DropdownOverlayButton>
                            ))
                        }
                    />
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
                            {isLinking && (
                                <FaCog
                                    className={styles.linkingSpinner}
                                    aria-label="Updating user match"
                                />
                            )}
                            {isSaving && (
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    disabled
                                >
                                    <FaCog className={styles.savingSpinner} />{' '}
                                    Saving {saveMutation.variables?.length}{' '}
                                    Change
                                    {saveMutation.variables?.length === 1
                                        ? ''
                                        : 's'}
                                </button>
                            )}
                            {isEditing && !isSaving && (
                                <EditToolbar
                                    members={members}
                                    editController={editController}
                                    saveMutation={saveMutation}
                                    discardEdits={discardEdits}
                                    onNavigateToChange={navigateToChange}
                                />
                            )}
                            {!isEditing && !isSaving && (
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    onClick={() => {
                                        setChangeTarget(null)
                                        setIsEditing(true)
                                    }}
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

                    <div
                        className={styles.tableWrapper}
                        onWheel={() => setChangeTarget(null)}
                        onTouchMove={() => setChangeTarget(null)}
                    >
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
                        ) : (
                            <Table
                                columns={columns}
                                data={visibleMembers}
                                rowKey={(m) => m.id}
                                loading={isPending}
                                loadingLabel="Loading membership records"
                                collapsedCategories={collapsedCategories}
                                options={{
                                    editing: isEditing,
                                    zebra: options.showZebra,
                                    reorderable: isEditing,
                                    entryOrder: columnOrder,
                                    onEntryOrderChange: onColumnOrderChange,
                                }}
                                isScrollTarget={isScrollTarget}
                                scrollToColumnKey={
                                    changeTarget?.columnKeys ?? searchColumnKeys
                                }
                                scrollToRowToken={scrollToMatchToken}
                                placeholderRowCount={estimatePlaceholderRows(
                                    hasNextPage,
                                    totalEntries,
                                    members.length,
                                    visibleMembers.length
                                )}
                                onPlaceholderVisible={loadMore}
                            />
                        )}
                    </div>
                </div>
                <SearchModal
                    open={memberToMatch != null}
                    onClose={() => {
                        setMemberToMatch(null)
                        linkMutation.reset()
                    }}
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
