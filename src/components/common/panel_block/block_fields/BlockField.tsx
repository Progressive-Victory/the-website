'use client'

import { useInfoBlockContext } from '../Block'
import styles from './BlockField.module.css'
import { DropdownMenu } from '@/components/common/dropdown_menu/DropdownMenu'
import {
    DiscordUser,
    UpdateHistory,
    User,
    zDiscordUser,
} from '@/contracts/data'
import { useFetch } from '@/util/hooks'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useQueries } from '@tanstack/react-query'
import type React from 'react'
import { useMemo, useRef, useState } from 'react'
import z from 'zod'

export interface BlockFieldProps {
    label: string
    ariaLabel?: string
    showIn?: 'both' | 'view' | 'edit'
    getter: (user: User) => React.ReactNode
    editGetter?: (user: User) => string
    setter?: (user: User, value: string) => User
    inputType?: React.HTMLInputTypeAttribute
    showHistory?: boolean
    children?: React.ReactNode
}

export function BlockField({
    label,
    ariaLabel,
    showIn = 'both',
    getter,
    editGetter,
    setter,
    inputType,
    showHistory = true,
    children,
}: BlockFieldProps) {
    const { user, draft, editing, onDraftChange, setFieldMenuOpen } =
        useInfoBlockContext()
    const { ready, onGet } = useFetch()
    const displayValue = getter(editing ? draft : user)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const fieldHistory = (() => {
        if (!showHistory || !user.history?.length) return []
        return [...user.history]
            .sort(
                (a, b) =>
                    new Date(b.historyWhenUpdatedUtc).getTime() -
                    new Date(a.historyWhenUpdatedUtc).getTime()
            )
            .reduce<{ entry: UpdateHistory<User>; value: React.ReactNode }[]>(
                (acc, entry) => {
                    const value = getter(entry as User)
                    if (
                        acc.length === 0 ||
                        value !== acc[acc.length - 1].value
                    ) {
                        acc.push({ entry, value })
                    }
                    return acc
                },
                []
            )
    })()

    const updaterIds = useMemo(
        () =>
            Array.from(
                new Set(
                    fieldHistory
                        .map((h) => h.entry.historyWhoUpdatedId)
                        .filter((id): id is number => id != null)
                )
            ),
        [fieldHistory]
    )

    const updaterQueries = useQueries({
        queries: updaterIds.map((id) => ({
            queryKey: [`/discordUsers/${id}`],
            queryFn: () =>
                onGet<DiscordUser[]>(
                    `/discordUsers/${id}`,
                    z.array(zDiscordUser)
                ),
            enabled: ready,
        })),
    })

    const usernameById = useMemo(() => {
        const map = new Map<number, string>()
        updaterQueries.forEach((query, i) => {
            const id = updaterIds[i]
            const username = query.data?.[0]?.username
            if (id != null && username) map.set(id, username)
        })
        return map
    }, [updaterQueries, updaterIds])

    if (showIn === 'view' && editing) return null
    if (showIn === 'edit' && !editing) return null

    const isEditable = editing && setter != null
    const isReadonlyInEdit = editing && !isEditable

    return (
        <div className={styles.infoBlockFieldRow}>
            <span className={styles.infoBlockFieldLabel}>{label}</span>
            {isEditable ? (
                <input
                    type={inputType ?? 'text'}
                    className={styles.infoBlockFieldInput}
                    value={editGetter ? editGetter(draft) : ''}
                    placeholder="Empty"
                    onChange={(e) =>
                        onDraftChange((u) => setter(u, e.target.value))
                    }
                    aria-label={ariaLabel}
                />
            ) : (
                <div className={styles.infoBlockButtonWrapper}>
                    <button
                        ref={triggerRef}
                        type="button"
                        className={styles.infoBlockInfoButton}
                        aria-label={ariaLabel}
                        aria-expanded={menuOpen}
                        disabled={isReadonlyInEdit}
                        onClick={() => {
                            const next = !menuOpen
                            setMenuOpen(next)
                            setFieldMenuOpen(next)
                        }}
                    >
                        <span className={styles.infoBlockFieldValue}>
                            {displayValue ?? '-'}
                        </span>
                        {!isReadonlyInEdit && (
                            <InformationCircleIcon
                                className={styles.infoBlockInfoIcon}
                            />
                        )}
                    </button>
                    {menuOpen && (
                        <DropdownMenu
                            triggerRef={triggerRef}
                            onClose={() => {
                                setMenuOpen(false)
                                setFieldMenuOpen(false)
                            }}
                            label={`${label} Information`}
                        >
                            {children}
                            {fieldHistory.length > 0 && (
                                <>
                                    {children != null && (
                                        <DropdownMenu.Divider />
                                    )}
                                    <div className={styles.historyLabel}>
                                        Update History
                                    </div>
                                    {fieldHistory.map(({ entry, value }, i) => {
                                        const prevValue =
                                            fieldHistory[i + 1]?.value
                                        const actor =
                                            entry.historyWhoUpdatedId != null
                                                ? `@${
                                                      usernameById.get(
                                                          entry.historyWhoUpdatedId
                                                      ) ??
                                                      `User #${entry.historyWhoUpdatedId}`
                                                  }`
                                                : 'System'
                                        const date = new Intl.DateTimeFormat(
                                            'en-US',
                                            {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            }
                                        ).format(
                                            new Date(
                                                entry.historyWhenUpdatedUtc
                                            )
                                        )
                                        return (
                                            <div
                                                key={entry.historyId}
                                                className={styles.historyEntry}
                                            >
                                                <span
                                                    className={
                                                        styles.historyEntryValue
                                                    }
                                                >
                                                    {label} updated
                                                </span>
                                                <span
                                                    className={
                                                        styles.historyEntryMeta
                                                    }
                                                >
                                                    {actor}
                                                    {' updated '}
                                                    {label}
                                                    {' from '}
                                                    {prevValue ?? '-'}
                                                    {' to '}
                                                    {value ?? '-'}
                                                    {' · '}
                                                    {date}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </DropdownMenu>
                    )}
                </div>
            )}
        </div>
    )
}
