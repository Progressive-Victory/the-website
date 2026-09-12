'use client'

import {
    useMembershipPanel,
    usePendingUpdates,
    useSaveMemberships,
    MembershipTableOptions,
} from './hooks'
import { EditController, Member } from './membership.types'
import { buildColumns, FULFILLMENT_CATEGORY } from './membershipColumns'
import styles from './page.module.css'
import { ListBody, ListElement } from '@/app/admin/layout/List'
import { SearchModal } from '@/app/admin/layout/SearchModal'
import {
    DropdownButton,
    DropdownOverlay,
    ToggleGroup,
} from '@/components/common'
import { Table } from '@/components/common/table'
import { UserProfile, zUserProfile } from '@/contracts/data'
import { ActBlueDonorLinkRequest } from '@/contracts/requests'
import { cn } from '@/util'
import { useCurrentUser, useFetch, usePaginatedSearch } from '@/util/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

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
    const { onPost } = useFetch()
    const loggedInUser = useCurrentUser()
    const queryClient = useQueryClient()
    const [memberToMatch, setMemberToMatch] = useState<Member | null>(null)
    const {
        members,
        totalEntries,
        options,
        setOption,
        tableMode,
        setTableMode,
        editController,
        saveMutation,
        discardEdits,
        hasNextPage,
        isFetchingNextPage,
        sentinelRef,
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

            await onPost(
                '/actblue/donors/:donorEmail/link',
                {
                    userId: user.id,
                    metaData: {
                        dataSource: 'Membership Panel',
                        userWhoUpdatedId: loggedInUser.data?.id,
                    },
                } satisfies ActBlueDonorLinkRequest,
                null,
                { params: { donorEmail } }
            )

            setMemberToMatch(null)
            await queryClient.invalidateQueries({
                queryKey: ['/actblue/memberships'],
            })
        },
        [loggedInUser.data?.id, memberToMatch?.donorEmail, onPost, queryClient]
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
            }),
        [options, tableMode, editController]
    )

    const collapsedCategories = useMemo(
        () => (options.collapseFulfillment ? [FULFILLMENT_CATEGORY] : []),
        [options.collapseFulfillment]
    )

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Membership</span>
                </div>

                <div className={styles.panelTimestamp}>
                    Entries Loaded: {members.length.toLocaleString()}
                    {totalEntries != null &&
                        ` of ${totalEntries.toLocaleString()}`}
                </div>
            </div>
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
                                                        setOption(key, value)
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <Table
                        columns={columns}
                        data={members}
                        rowKey={(m) => m.id}
                        collapsedCategories={collapsedCategories}
                        mode={tableMode}
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
    )
}
