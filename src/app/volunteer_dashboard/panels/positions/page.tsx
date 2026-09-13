'use client'

import styles from './page.module.css'
import { ListElement } from '@/app/admin/layout/List'
import { SearchModal } from '@/app/admin/layout/SearchModal'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import {
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms/FormField'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { Position, UserProfile, zUserProfile } from '@/contracts/data'
import { SearchRequest, SortDirection } from '@/contracts/requests'
import {
    PaginatedResponse,
    PositionHierarchyResponse,
} from '@/contracts/responses'
import { usePositionQueries } from '@/queries'
import { cn } from '@/util'
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    usePaginatedSearch,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChangeEvent, useCallback, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

function getUserDisplayName(user: UserProfile | undefined): string {
    if (!user) return 'Unknown'
    if (user.firstName && user.lastName)
        return `${user.firstName} ${user.lastName}`
    const discord = user.discordUsers?.[0]?.username
    if (discord) return `@${discord}`
    if (user.preferredName) return user.preferredName
    if (user.email) return user.email
    return 'Unknown'
}

const blankPosition: Position = {
    id: -1,
    name: '',
    childIds: [],
    userIds: [],
}

export default function Page() {
    const queryClient = useQueryClient()
    const positionQueries = usePositionQueries()

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        null
    )
    const [formState, setFormState] = useState<FormState<Position> | null>(null)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })

    const {
        query: userSearchQuery,
        search: userSearch,
        onSearch: onUserSearch,
    } = usePaginatedSearch('/users', zUserProfile, {
        search: { sort: SortDirection.ASC },
    })

    const {
        items: positions,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: positionHierarchy.data?.positions ?? [],
        initialSearch: { sort: SortDirection.ASC },
        onFilter: (position, query) =>
            position.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
        onSort: (a, b) => a.name.localeCompare(b.name),
    })

    const positionMap = new Map<number, string>()
    for (const p of positionHierarchy.data?.positions ?? []) {
        positionMap.set(p.id, p.name)
    }

    const pageUserMap = new Map<number, UserProfile>()
    for (const u of positionHierarchy.data?.users ?? []) {
        pageUserMap.set(u.id, u)
    }
    for (const u of userSearchQuery.data?.data ?? []) {
        pageUserMap.set(u.id, u)
    }

    const handleSelectItem = (value: Position): boolean => {
        if (value.id === selectedPosition?.id) return false

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return false
        }

        setSelectedPosition(value)
        return true
    }

    const updatePositionInHierarchyCache = (
        id: number,
        value: Position | null,
        index?: number
    ) => {
        queryClient.setQueryData(
            ['positionHierarchy'],
            (res: PositionHierarchyResponse) => {
                const positions = [...res.positions]
                const currIndex = positions.findIndex((p) => p.id == id)
                const newIndex =
                    index ?? (currIndex < 0 ? positions.length : currIndex)

                if (currIndex >= 0) positions.splice(currIndex, 1)
                if (value) positions.splice(newIndex, 0, value)
                return { ...res, positions }
            }
        )
    }

    const createMutation = useOptimisticUpdate<Position>({
        mutationFn: ({ newValue }) =>
            positionQueries.createPosition({
                name: newValue.name,
                parentIds: [],
            }),
        onChange: (value) => {
            setSelectedPosition(value)
            updatePositionInHierarchyCache(blankPosition.id, value)
        },
    })

    const updateMutation = useOptimisticUpdate<Position>({
        mutationFn: ({ newValue }) =>
            positionQueries.updatePosition(newValue.id, {
                name: newValue.name,
                childIds: newValue.childIds,
                userIds: newValue.userIds,
            }),
        onChange: (value) => {
            setSelectedPosition(value)
            updatePositionInHierarchyCache(value.id, value)
        },
    })

    const deleteMutation = useOptimisticDelete<Position, { index: number }>({
        mutationFn: ({ currentValue }) =>
            positionQueries.deletePosition(currentValue.id),
        onChange: (value, { currentValue, params: { index } }) => {
            setSelectedPosition(value ?? null)
            updatePositionInHierarchyCache(
                currentValue.id,
                value ?? null,
                index
            )
        },
    })

    const handleCreate = () => blankPosition

    const handleSave = (newPosition: Position) => {
        if (formState?.mode === 'create') {
            createMutation.mutate({
                currentValue: blankPosition,
                newValue: newPosition,
            })
        } else if (selectedPosition != null) {
            updateMutation.mutate({
                currentValue: selectedPosition,
                newValue: newPosition,
            })
        }
    }

    const handleDelete = () => {
        if (!selectedPosition) return

        const index =
            positionHierarchy.data?.positions?.findIndex(
                (p) => p.id == selectedPosition.id
            ) ?? -1
        if (index < 0) return

        deleteMutation.mutate({
            currentValue: selectedPosition,
            newValue: undefined,
            params: { index },
        })
    }

    return (
        <Panel
            includeSidebar
            largeTitle
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Positions"
            showScrollbar={false}
            sidebarList={{
                search: { search, onSearch },
                filters: {
                    search,
                    onSearch,
                    showSort: true,
                    showLimit: false,
                },
            }}
            sidebarBody={
                <SidebarBody<Position>
                    items={positions}
                    isLoading={positionHierarchy.isPending}
                    error={positionHierarchy.error}
                    selectedKey={selectedPosition?.id}
                    renderItem={(position) => ({
                        key: position.id,
                        label: position.name,
                        href: `/volunteer_dashboard/panels/positions?positionId=${position.id}`,
                        onClick: (event) => {
                            event.preventDefault()
                            const selected = handleSelectItem(position)
                            if (selected && !isDesktop) {
                                setSidebarMobileVisible(false)
                            }
                        },
                    })}
                />
            }
        >
            <div className={styles.detailPane}>
                <MobileSidebarBackButton
                    label="Positions"
                    sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                    onBack={() => setSidebarMobileVisible(true)}
                />
                <Form<Position>
                    key={selectedPosition?.id}
                    form={selectedPosition}
                    title={
                        formState?.mode == 'create'
                            ? 'New Position'
                            : (selectedPosition?.name ?? 'Position')
                    }
                    saving={
                        createMutation.isPending ||
                        updateMutation.isPending ||
                        deleteMutation.isPending
                    }
                    onUpdate={setFormState}
                    onSave={handleSave}
                    onCreate={handleCreate}
                    onDelete={handleDelete}
                >
                    <FormGroup title="Details">
                        <TextField label="Name" field="name" required />
                    </FormGroup>
                    {formState?.mode !== 'create' && selectedPosition && (
                        <FormGroup title="People">
                            <OccupantsField
                                label="People"
                                field="userIds"
                                allUsers={positionHierarchy.data?.users ?? []}
                                userSearchQuery={userSearchQuery}
                                userSearch={userSearch}
                                onUserSearch={onUserSearch}
                                editing={formState?.mode === 'edit'}
                            />
                        </FormGroup>
                    )}
                    {formState?.mode !== 'create' && selectedPosition && (
                        <FormGroup title="Subordinates">
                            <SubordinatesField
                                label="Subordinates"
                                field="childIds"
                                positionMap={positionMap}
                                allPositions={
                                    positionHierarchy.data?.positions ?? []
                                }
                                currentPositionId={selectedPosition.id}
                                editing={formState?.mode === 'edit'}
                                userMap={pageUserMap}
                            />
                        </FormGroup>
                    )}
                </Form>
            </div>
        </Panel>
    )
}

interface SubordinatesFieldProps extends FormFieldProps<Position, number[]> {
    positionMap: Map<number, string>
    allPositions: Position[]
    currentPositionId: number
    editing: boolean
    userMap: Map<number, UserProfile>
}

function SubordinatesField(props: SubordinatesFieldProps) {
    const { getter, onChange } = useConfigure(
        props,
        useCallback(() => true, [])
    )

    const childIds = getter(props.dynamic!.form) ?? []
    const [pickerOpen, setPickerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleRemove = (idToRemove: number) => {
        onChange(childIds.filter((id) => id !== idToRemove))
    }

    const handleAdd = (id: number) => {
        if (!childIds.includes(id)) {
            onChange([...childIds, id])
        }
        setPickerOpen(false)
        setSearchQuery('')
    }

    const filteredPositions = (() => {
        const excluded = new Set([props.currentPositionId, ...childIds])
        return props.allPositions
            .filter(
                (p) =>
                    !excluded.has(p.id) &&
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name))
    })()

    return (
        <div className={styles.subPositions}>
            <div className={styles.subPositionsContainer}>
                {childIds.length === 0 && !props.editing && (
                    <div className={styles.subPositionEntryEmpty}>
                        No subordinates
                    </div>
                )}
                {childIds.map((id) => {
                    const pos = props.allPositions.find((p) => p.id === id)
                    const assignedUsers = (pos?.userIds ?? [])
                        .map((uid) => props.userMap.get(uid))
                        .filter(Boolean)
                    return (
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
                                aria-label={`Remove ${props.positionMap.get(id) ?? 'position'}`}
                            >
                                −
                            </button>
                            <span className={styles.subPositionEntryText}>
                                {props.positionMap.get(id) ?? `Unknown (${id})`}
                            </span>
                            <span className={styles.subPositionTags}>
                                {assignedUsers.length > 0 ? (
                                    assignedUsers.map((u) => (
                                        <span
                                            key={u!.id}
                                            className={styles.subPositionTag}
                                        >
                                            {getUserDisplayName(u)}
                                        </span>
                                    ))
                                ) : (
                                    <span className={styles.subPositionTag}>
                                        Unfilled
                                    </span>
                                )}
                            </span>
                        </div>
                    )
                })}
                {props.editing && (
                    <button
                        type="button"
                        className={styles.addRow}
                        onClick={() => setPickerOpen(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Add Subordinate Positions
                    </button>
                )}
            </div>

            <SearchModal
                open={pickerOpen}
                onClose={() => {
                    setPickerOpen(false)
                    setSearchQuery('')
                }}
                title="Add Subordinates"
                subtitle="Search for a position to add as a subordinate."
                searchValue={searchQuery}
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                }
            >
                {filteredPositions.map((p) => (
                    <ListElement
                        key={p.id}
                        className={styles.pickerItem}
                        onClick={() => handleAdd(p.id)}
                    >
                        {p.name}
                    </ListElement>
                ))}
                {filteredPositions.length === 0 && (
                    <div className={styles.pickerEmpty}>
                        No positions available
                    </div>
                )}
            </SearchModal>
        </div>
    )
}

interface OccupantsFieldProps extends FormFieldProps<Position, number[]> {
    allUsers: UserProfile[]
    userSearchQuery: {
        data?: PaginatedResponse<UserProfile>
        isPending: boolean
    }
    userSearch: SearchRequest
    onUserSearch: (req: SearchRequest) => void
    editing: boolean
}

function OccupantsField(props: OccupantsFieldProps) {
    const { getter, onChange } = useConfigure(
        props,
        useCallback(() => true, [])
    )

    const userIds = getter(props.dynamic!.form) ?? []
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

    const handleAdd = (id: number) => {
        if (!userIds.includes(id)) {
            onChange([...userIds, id])
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
                {userIds.length === 0 && !props.editing && (
                    <div className={styles.subPositionEntryEmpty}>
                        Unfilled Position
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
                {props.editing && (
                    <button
                        type="button"
                        className={styles.addRow}
                        onClick={() => setPickerOpen(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Assign Member
                    </button>
                )}
            </div>

            <SearchModal
                open={pickerOpen}
                onClose={() => {
                    setPickerOpen(false)
                    props.onUserSearch({ ...props.userSearch, query: '' })
                }}
                title="Assign Member"
                subtitle="Search for a member to assign to this position."
                searchValue={props.userSearch.query ?? ''}
                onSearchChange={handleSearchChange}
            >
                {searchResults.map((u) => {
                    const hasName = !!(u.firstName && u.lastName)
                    const discord = u.discordUsers?.[0]?.username
                    return (
                        <ListElement
                            key={u.id}
                            className={styles.pickerItem}
                            onClick={() => handleAdd(u.id)}
                        >
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
                        </ListElement>
                    )
                })}
                {searchResults.length === 0 &&
                    !props.userSearchQuery.isPending && (
                        <div className={styles.pickerEmpty}>
                            No members available
                        </div>
                    )}
                {props.userSearchQuery.isPending && (
                    <div className={styles.pickerEmpty}>Loading...</div>
                )}
            </SearchModal>
        </div>
    )
}
