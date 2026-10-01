'use client'

import styles from './page.module.css'
import {
    getUserDisplayName,
    positionTypeLabels,
    positionTypeOptions,
    relationshipTypeLabels,
    relationshipTypeOptions,
} from './positions.utils'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import {
    Form,
    FormControls,
    FormGroup,
    FormState,
    DropDownField,
    NumberField,
    TextField,
} from '@/components/common/forms'
import {
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms/FormField'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { type SidebarListFiltersProps } from '@/components/common/panel/sidebar_list/SidebarList'
import { usePositionQueries } from '@/queries'
import { cn } from '@/util'
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    usePaginatedSearch,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Position,
    PositionTypes,
    Relationship,
    RelationshipTypes,
    UserProfile,
    zUserProfile,
} from 'pv-contracts/data'
import { SearchRequest, SortDirection } from 'pv-contracts/requests'
import {
    PaginatedResponse,
    PositionHierarchyResponse,
} from 'pv-contracts/responses'
import { ChangeEvent, useCallback, useRef, useState } from 'react'
import { FaRegPenToSquare } from 'react-icons/fa6'
import { useMediaQuery } from 'usehooks-ts'

const blankPosition: Position = {
    id: -1,
    name: '',
    childRelationships: [],
    userIds: [],
    type: PositionTypes.POSITION,
    seats: 1,
    permissions: [],
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

    const allPositions = positionHierarchy.data?.positions ?? []

    const positionById = new Map(allPositions.map((p) => [p.id, p]))

    const groupedChildIds = new Set(
        allPositions
            .filter((p) => p.type === PositionTypes.GROUP)
            .flatMap((p) => p.childRelationships.map((rel) => rel.id))
    )

    const {
        items: positions,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: allPositions.filter((p) => !groupedChildIds.has(p.id)),
        initialSearch: { sort: SortDirection.ASC },
        onFilter: (position, query) =>
            position.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
        onSort: (a, b) => a.name.localeCompare(b.name),
    })

    const pageUserMap = new Map(
        [
            ...(positionHierarchy.data?.users ?? []),
            ...(userSearchQuery.data?.data ?? []),
        ].map((u) => [u.id, u])
    )

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
                parentRelationships: [],
                positionType: newValue.type,
                seats: newValue.seats,
                permission: newValue.permissions,
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
                childRelationships: newValue.childRelationships,
                userIds: newValue.userIds,
                positionType: newValue.type,
                seats: newValue.seats,
                permissions: newValue.permissions,
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

    const seats = formState?.form.seats ?? selectedPosition?.seats ?? 0

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

    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        showSort: true,
        showLimit: false,
    }

    const formControls = useRef<FormControls>(null)

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
                filters: sidebarFilters,
            }}
            prominentHeaderButton={{
                icon: <FaRegPenToSquare size={20} />,
                label: 'Create Position',
                onClick: () => formControls.current?.create(),
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
                        subtitle: positionTypeLabels[position.type],
                        tagCount:
                            position.type === PositionTypes.GROUP
                                ? undefined
                                : position.seats,
                        buttonType:
                            position.type === PositionTypes.GROUP
                                ? 'group'
                                : 'default',
                        children: position.childRelationships
                            .map(({ id }) => positionById.get(id))
                            .filter((child) => child != null)
                            .sort((a, b) => a.name.localeCompare(b.name)),
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
                    showCreateButton={false}
                    controlsRef={formControls}
                    onDelete={handleDelete}
                >
                    <FormGroup title="Details">
                        <TextField label="Name" field="name" required />
                        <DropDownField<Position>
                            label="Type"
                            getter={(form) => form.type}
                            setter={(form, field) => ({
                                ...form,
                                type: Number(field),
                            })}
                            options={positionTypeOptions}
                        />
                        <NumberField label="Seats" field="seats" required />
                    </FormGroup>
                    {formState?.mode !== 'create' &&
                        selectedPosition &&
                        seats > 0 && (
                            <FormGroup title="People">
                                <OccupantsField
                                    label="People"
                                    field="userIds"
                                    allUsers={
                                        positionHierarchy.data?.users ?? []
                                    }
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
                                field="childRelationships"
                                positionById={positionById}
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

interface SubordinatesFieldProps extends FormFieldProps<
    Position,
    Relationship[]
> {
    positionById: Map<number, Position>
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

    const childRelationships = getter(props.dynamic!.form) ?? []
    const [pickerOpen, setPickerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleRemove = (idToRemove: number) => {
        onChange(childRelationships.filter((rel) => rel.id !== idToRemove))
    }

    const handleAdd = (id: number) => {
        if (!childRelationships.some((rel) => rel.id === id)) {
            onChange([
                ...childRelationships,
                { id, type: RelationshipTypes.OWNER },
            ])
        }
        setPickerOpen(false)
        setSearchQuery('')
    }

    const handleChangeType = (id: number, type: RelationshipTypes) => {
        onChange(
            childRelationships.map((rel) =>
                rel.id === id ? { ...rel, type } : rel
            )
        )
    }

    const filteredPositions = (() => {
        const excluded = new Set([
            props.currentPositionId,
            ...childRelationships.map((rel) => rel.id),
        ])
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
                {childRelationships.length === 0 && !props.editing && (
                    <div className={styles.subPositionEntryEmpty}>
                        No subordinates
                    </div>
                )}
                {childRelationships.map(({ id, type }) => {
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
                                aria-label={`Remove ${props.positionById.get(id)?.name ?? 'position'}`}
                            >
                                −
                            </button>
                            <span className={styles.subPositionEntryText}>
                                {props.positionById.get(id)?.name ??
                                    `Unknown (${id})`}
                            </span>
                            <span className={styles.subPositionTags}>
                                {props.editing ? (
                                    <select
                                        className={styles.relationshipSelect}
                                        value={type}
                                        aria-label={`Relationship type for ${props.positionById.get(id)?.name ?? 'position'}`}
                                        onChange={(event) =>
                                            handleChangeType(
                                                id,
                                                Number(event.target.value)
                                            )
                                        }
                                    >
                                        {relationshipTypeOptions.map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                ) : (
                                    <span className={styles.subPositionTag}>
                                        {relationshipTypeLabels[type]}
                                    </span>
                                )}
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
                    <button
                        key={p.id}
                        type="button"
                        className={styles.pickerItem}
                        onClick={() => handleAdd(p.id)}
                    >
                        {p.name}
                    </button>
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
    const seats = props.dynamic!.form.seats ?? 0
    const openSeats = Math.max(seats - userIds.length, 0)
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
        if (!userIds.includes(id) && openSeats > 0) {
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
                {Array.from({ length: openSeats }, (_, index) =>
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
                        <button
                            key={u.id}
                            type="button"
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
                        </button>
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
