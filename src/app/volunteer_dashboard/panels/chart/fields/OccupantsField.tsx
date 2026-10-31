'use client'

import { ChartModalPortal } from '../ChartModalPortal'
import { Position, UserProfile, type MemberSearch } from '../domain/chart.types'
import styles from '../page.module.css'
import { getUserDisplayName } from '../positions.list'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import {
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms/FormField'
import { cn, parseErrorMessage } from '@/util'
import { ChangeEvent, useCallback, useState } from 'react'

interface OccupantsFieldProps extends FormFieldProps<Position, number[]> {
    allUsers: UserProfile[]
    onAssignUser: (user: UserProfile) => void
    userSearchQuery: {
        data?: {
            data: UserProfile[]
        }
        isPending: boolean
        isFetching: boolean
        error: Error | null
    }
    userSearch: MemberSearch
    onUserSearch: (req: MemberSearch) => void
    editing: boolean
}

export function OccupantsField(props: OccupantsFieldProps) {
    const { getter, onChange } = useConfigure(
        props,
        useCallback(() => true, [])
    )
    const userIds = getter(props.dynamic!.form) ?? []
    const seats = props.dynamic!.form.seats
    const openSeats = seats === null ? 0 : Math.max(seats - userIds.length, 0)
    const atCapacity = seats !== null && openSeats === 0
    const assignmentRows = seats === null ? Number(props.editing) : openSeats
    const [pickerOpen, setPickerOpen] = useState(false)
    const userMap = new Map<number, UserProfile>()
    for (const u of props.allUsers) {
        userMap.set(u.id, u)
    }
    for (const u of props.userSearchQuery.data?.data ?? []) {
        userMap.set(u.id, u)
    }
    const handleRemove = (idToRemove: number) => {
        onChange(userIds.filter((id) => id !== idToRemove))
    }
    const handleAdd = (user: UserProfile) => {
        if (!userIds.includes(user.id) && !atCapacity) {
            props.onAssignUser(user)
            onChange([...userIds, user.id])
        }
        setPickerOpen(false)
        props.onUserSearch({ ...props.userSearch, query: '' })
    }
    const searchResults = (() => {
        const excluded = new Set(userIds)
        return (props.userSearchQuery.data?.data ?? []).filter(
            (u) => !excluded.has(u.id)
        )
    })()
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        props.onUserSearch({ ...props.userSearch, query: e.target.value })
    }
    return (
        <div className={styles.subPositions}>
            <div className={styles.subPositionsContainer}>
                {seats === null && userIds.length === 0 && !props.editing && (
                    <div className={styles.subPositionEntryEmpty}>
                        No people assigned
                    </div>
                )}
                {userIds.map((id) => (
                    <div
                        key={id}
                        className={cn(
                            styles.subPositionEntry,
                            props.editing && styles.subPositionEntryEditing
                        )}
                    >
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleRemove(id)}
                            aria-label={`Remove ${getUserDisplayName(userMap.get(id))}`}
                        >
                            −
                        </button>
                        <span
                            className={
                                userMap.get(id)?.firstName &&
                                userMap.get(id)?.lastName
                                    ? styles.subPositionEntryText
                                    : styles.subPositionEntryTextSub
                            }
                        >
                            {getUserDisplayName(userMap.get(id))}
                        </span>
                    </div>
                ))}
                {Array.from({ length: assignmentRows }, (_, index) =>
                    props.editing ? (
                        <button
                            key={`open-seat-${index}`}
                            type="button"
                            className={styles.addRow}
                            onClick={() => setPickerOpen(true)}
                        >
                            <span className={styles.addIcon}>+</span>
                            Assign Member
                        </button>
                    ) : (
                        <div
                            key={`open-seat-${index}`}
                            className={styles.subPositionEntryEmpty}
                        >
                            Unfilled Seat
                        </div>
                    )
                )}
            </div>

            <ChartModalPortal>
                <SearchModal
                    open={pickerOpen}
                    onClose={() => {
                        setPickerOpen(false)
                        props.onUserSearch({ ...props.userSearch, query: '' })
                    }}
                    title="Assign Member"
                    loading={props.userSearchQuery.isFetching}
                    subtitle="Search for a member to assign to this position."
                    searchValue={props.userSearch.query ?? ''}
                    onSearchChange={handleSearchChange}
                >
                    {props.userSearchQuery.error && (
                        <div role="alert" className={styles.pickerEmpty}>
                            {parseErrorMessage(props.userSearchQuery.error)}
                        </div>
                    )}
                    {searchResults.map((u) => {
                        const hasName = !!(u.firstName && u.lastName)
                        const discord = u.discordUsers?.[0]?.username
                        return (
                            <button
                                key={u.id}
                                type="button"
                                className={styles.pickerItem}
                                onClick={() => handleAdd(u)}
                            >
                                <DiscordAvatar
                                    discordUserId={u.discordUsers?.[0]?.id}
                                    imageId={
                                        u.discordUsers?.[0]?.image ?? undefined
                                    }
                                    size={40}
                                    className={styles.pickerAvatar}
                                />
                                <span className={styles.pickerItemDetails}>
                                    {hasName && (
                                        <span className={styles.pickerItemName}>
                                            {`${u.firstName} ${u.lastName}`}
                                        </span>
                                    )}
                                    <span className={styles.pickerItemSub}>
                                        {discord
                                            ? `@${discord}`
                                            : (u.email ?? `User #${u.id}`)}
                                    </span>
                                </span>
                            </button>
                        )
                    })}
                    {searchResults.length === 0 &&
                        !props.userSearchQuery.error &&
                        !props.userSearchQuery.isPending && (
                            <div className={styles.pickerEmpty}>
                                No members available
                            </div>
                        )}
                    {props.userSearchQuery.isPending && (
                        <div className={styles.pickerEmpty}>Loading...</div>
                    )}
                </SearchModal>
            </ChartModalPortal>
        </div>
    )
}
