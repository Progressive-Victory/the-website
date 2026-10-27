'use client'

import { ChartModalHostContext } from './ChartModalPortal'
import { SidebarFilterTags } from './SidebarFilterTags'
import { ChartCanvas, type ChartCanvasHandle } from './canvas/ChartCanvas'
import type {
    DirectionChevronMode,
    LinePointCoordinates,
} from './canvas/LineEditingContext'
import { insertLinePoint } from './canvas/linePoints'
import { canConnectPositions } from './canvas/positions.connections'
import {
    Position,
    PositionTypes,
    UserProfile,
    type Line,
    type BranchPoint,
} from './domain/chart.types'
import {
    lineError,
    lineEndpoints,
    usedBranchPoints,
    exclusiveSourceLines,
} from './domain/lineGraph'
import {
    createLine,
    splitBranch,
    mergeBranch,
    deleteBranch,
    deleteBranchPoint,
    simplifyLines,
} from './domain/lineOperations'
import { useChartEditor } from './editor/useChartEditor'
import {
    GroupMembershipField,
    reparentPosition,
} from './fields/GroupMembershipField'
import { LineDetails } from './fields/LineDetails'
import { OccupantsField } from './fields/OccupantsField'
import { SubordinatesField } from './fields/SubordinatesField'
import styles from './page.module.css'
import {
    positionTypeOptions,
    positionTypeLabels,
    getPositionListChildren,
    positionListItem,
} from './positions.list'
import { BackButton } from '@/components/common/buttons'
import {
    Form,
    FormGroup,
    FormState,
    DropDownField,
    NumberField,
    TextField,
} from '@/components/common/forms'
import type { FormControls } from '@/components/common/forms/Form'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { type SidebarListFiltersProps } from '@/components/common/panel/sidebar_list/SidebarList'
import { parseErrorMessage } from '@/util'
import {
    useAssignedUsers,
    usePaginatedSearch,
    useUnpaginatedSearch,
} from '@/util/hooks'
import deepEqual from 'deep-equal'
import { zUserProfile } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FaRegPenToSquare } from 'react-icons/fa6'

const blankPosition: Position = {
    id: -1,
    name: '',
    coordinates: { x: 0, y: 0 },
    userIds: [],
    type: PositionTypes.POSITION,
    seats: 1,
}

export default function Page() {
    const chartControls = useRef<ChartCanvasHandle>(null)
    const formControls = useRef<FormControls<Position>>(null)

    const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
    const [selectedLinePoint, setSelectedLinePoint] = useState<{
        lineId: string
        pointId: string
    } | null>(null)
    const [linePointCoordinates, setLinePointCoordinates] =
        useState<LinePointCoordinates>({})
    const reportLinePointCoordinates = useCallback(
        (coordinates: LinePointCoordinates) => {
            setLinePointCoordinates((previous) => {
                const next = { ...previous, ...coordinates }
                return deepEqual(previous, next) ? previous : next
            })
        },
        []
    )

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        null
    )
    const [formState, setFormState] = useState<FormState<Position> | null>(null)
    const [showPositionDetails, setShowPositionDetails] = useState(false)
    const [modalHost, setModalHost] = useState<HTMLDivElement | null>(null)
    const [assignedUsers, setAssignedUsers] = useState<UserProfile[]>([])

    const [showHitboxes, setShowHitboxes] = useState(true)
    const [directionChevrons, setDirectionChevrons] =
        useState<DirectionChevronMode>('all')

    const {
        chartBranchPoints,
        isLoading,
        storageError,
        isEditing,
        editRevision,
        deletedPositionIds,
        chartPositions,
        chartLines,
        linesDirty,
        linesValid,
        invalidLine,
        renderedLines,
        changedDrafts,
        discardDrafts,
        saveDrafts,
        updatePositionDraft,
        updateLineGraph,
        startEditing,
        createPosition,
        getPositionDraft,
        replacePosition,
        deletePositions,
        replaceLines,
        addLine,
        changeBranchPoint,
        moveLinePoints,
        pasteSelection,
        movePosition,
        resizeGroups,
    } = useChartEditor({
        onSaved: (saved) => {
            setSelectedPosition(
                saved.document.positions.find(
                    ({ id }) =>
                        id ===
                        (saved.createdIds.get(selectedPosition?.id ?? 0) ??
                            selectedPosition?.id)
                ) ?? null
            )
        },
        onSaveSuccess: () => setFormState(null),
        onDiscard: (positions) => {
            setSelectedLineId(null)
            setFormState(null)
            if (selectedPosition && selectedPosition.id < 0) {
                setSelectedPosition(null)
                setShowPositionDetails(false)
            } else {
                setSelectedPosition(
                    positions.find(({ id }) => id === selectedPosition?.id) ??
                        null
                )
            }
        },
    })
    const onFormUpdate = useCallback(
        (state: FormState<Position>) => {
            setFormState(state)
            updatePositionDraft(state)
        },
        [updatePositionDraft]
    )
    const {
        query: userSearchQuery,
        search: userSearch,
        onSearch: onUserSearch,
    } = usePaginatedSearch('/users', zUserProfile, {
        search: { sort: SortDirection.ASC, limit: 25 },
    })

    const positionById = new Map(chartPositions.map((p) => [p.id, p]))

    const selectedLine = chartLines.find(({ id }) => id === selectedLineId)

    const changeLine = (line: Line, branchPoints?: BranchPoint[]) => {
        if (!isEditing || saveDrafts.isPending) return
        const nextBranchPoints = branchPoints ?? chartBranchPoints
        const nextLines = simplifyLines(
            chartLines.map((item) => (item.id === line.id ? line : item)),
            new Set(chartPositions.map(({ id }) => id)),
            nextBranchPoints
        )
        updateLineGraph(
            nextLines,
            usedBranchPoints(nextLines, nextBranchPoints)
        )
    }
    const removeBranchPoint = (id: string, targetPointId?: string) => {
        if (!isEditing || saveDrafts.isPending) return
        try {
            const result = deleteBranchPoint(
                chartLines,
                chartBranchPoints,
                id,
                new Set(chartPositions.map(({ id }) => id)),
                targetPointId
            )
            updateLineGraph(result.lines, result.branchPoints)
            if (!result.lines.some((line) => line.id === selectedLineId))
                setSelectedLineId(null)
        } catch (error) {
            console.error('Failed to remove branchpoint', error)
            alert(
                `Branchpoint could not be removed. ${parseErrorMessage(error)}`
            )
        }
    }
    const detailPosition = selectedPosition
        ? positionById.get(selectedPosition.id)
        : undefined
    const groupedChildIds = new Set(
        chartPositions
            .filter((p) => p.type === PositionTypes.GROUP)
            .flatMap((p) =>
                getPositionListChildren(p, positionById).map(({ id }) => id)
            )
    )

    const {
        items: positions,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: chartPositions
            .filter((p) => !groupedChildIds.has(p.id))
            .sort((a, b) => a.name.localeCompare(b.name)),
        onFilter: (position, query) =>
            position.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
        onSort: (a, b) => a.name.localeCompare(b.name),
    })

    const { users: fetchedAssignedUsers, error: assignedUsersError } =
        useAssignedUsers(chartPositions)
    const knownUsers = useMemo(
        () =>
            Array.from(
                new Map(
                    [
                        ...fetchedAssignedUsers,
                        ...assignedUsers,
                        ...(userSearchQuery.data?.data ?? []),
                    ].map((user) => [user.id, user])
                ).values()
            ),
        [fetchedAssignedUsers, assignedUsers, userSearchQuery.data?.data]
    )

    const rememberAssignedUser = (user: UserProfile) => {
        setAssignedUsers((users) => [
            ...users.filter((knownUser) => knownUser.id !== user.id),
            user,
        ])
    }

    const handleSelectItem = (value: Position | null): boolean => {
        if (saveDrafts.isPending) return false
        setSelectedLineId(null)
        if (value?.id === selectedPosition?.id) return true

        setFormState(null)
        setSelectedPosition(value)
        return true
    }

    const handleCreate = () => {
        if (saveDrafts.isPending || isLoading || storageError) return
        let coordinates: Position['coordinates']
        try {
            if (!chartControls.current)
                throw new Error('The chart is not ready to create a position.')
            coordinates = chartControls.current.getNewPositionCoordinates()
        } catch (error) {
            console.error('Failed to place a new position', error)
            alert(`Position could not be created. ${parseErrorMessage(error)}`)
            return
        }
        const position = createPosition(blankPosition, coordinates)
        setSelectedLineId(null)
        setSelectedPosition(position)
        setFormState(null)

        setShowPositionDetails(true)
    }

    const seats = formState?.form.seats ?? selectedPosition?.seats ?? 0
    const isGroup =
        (formState?.form.type ?? selectedPosition?.type) === PositionTypes.GROUP

    const handleDelete = () => {
        if (!selectedPosition || saveDrafts.isPending) return
        const id = selectedPosition.id
        deletePositions([id])
        setSelectedPosition(null)
        setFormState(null)
        setShowPositionDetails(false)
    }

    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        showSort: true,
        showLimit: false,
    }

    return (
        <ChartModalHostContext.Provider value={modalHost}>
            <Panel
                includeHeader
                includeSidebar
                largeTitle={!showPositionDetails && !selectedLine}
                sidebarWidth="21.5rem"
                sidebarClassName={styles.sidebarBg}
                label="Positions"
                headerRight={
                    <div className={styles.headerToggles}>
                        <button
                            type="button"
                            className={styles.hitboxToggle}
                            aria-pressed={showHitboxes}
                            onClick={() =>
                                setShowHitboxes((visible) => !visible)
                            }
                        >
                            Hitboxes: {showHitboxes ? 'On' : 'Off'}
                        </button>
                        <label className={styles.hitboxToggle}>
                            Direction lines:
                            <select
                                className={styles.directionSelect}
                                value={directionChevrons}
                                onChange={(event) =>
                                    setDirectionChevrons(
                                        event.target
                                            .value as DirectionChevronMode
                                    )
                                }
                            >
                                <option value="all">Yes</option>
                                <option value="none">No</option>
                                <option value="merges">Merges only</option>
                            </select>
                        </label>
                    </div>
                }
                sidebarLabel={
                    showPositionDetails || selectedLine ? '' : 'Positions'
                }
                prominentHeaderLeft={
                    showPositionDetails || selectedLine ? (
                        <BackButton
                            label="Positions"
                            onClick={() => {
                                setShowPositionDetails(false)
                                setSelectedLineId(null)
                            }}
                        />
                    ) : undefined
                }
                showScrollbar={false}
                sidebarList={
                    showPositionDetails || selectedLine
                        ? undefined
                        : {
                              search: { search, onSearch },
                              filters: sidebarFilters,
                          }
                }
                prominentHeaderButton={{
                    icon: <FaRegPenToSquare size={20} />,
                    label: 'Create Position',
                    onClick: () => {
                        handleCreate()
                    },
                }}
                sidebarBody={
                    <>
                        {invalidLine && invalidLine.id !== selectedLineId && (
                            <p role="alert">
                                Line {invalidLine.id}: {lineError(invalidLine)}
                            </p>
                        )}
                        <div hidden={showPositionDetails || !!selectedLine}>
                            <div className={styles.filterTagsWrapper}>
                                <SidebarFilterTags positions={chartPositions} />
                            </div>
                            <SidebarBody<Position>
                                items={positions}
                                isLoading={isLoading}
                                error={storageError}
                                selectedKey={selectedPosition?.id}
                                renderItem={(position) =>
                                    positionListItem(
                                        position,
                                        positionById,
                                        (event) => {
                                            event.preventDefault()
                                            const selected =
                                                handleSelectItem(position)
                                            if (selected) {
                                                setShowPositionDetails(true)
                                            }
                                        }
                                    )
                                }
                            />
                        </div>
                        {selectedLine && (
                            <LineDetails
                                key={selectedLine.id}
                                selectedPointId={
                                    selectedLinePoint?.lineId ===
                                    selectedLine.id
                                        ? selectedLinePoint.pointId
                                        : null
                                }
                                onSelectPoint={(pointId) =>
                                    setSelectedLinePoint(
                                        pointId
                                            ? {
                                                  lineId: selectedLine.id,
                                                  pointId,
                                              }
                                            : null
                                    )
                                }
                                lines={chartLines}
                                branchPoints={chartBranchPoints}
                                usedBranchPoints={
                                    new Set(
                                        chartLines.flatMap((line) =>
                                            line.points.flatMap((point) =>
                                                point.kind === 'branchpoint' &&
                                                point === line.points[0]
                                                    ? [point.id]
                                                    : []
                                            )
                                        )
                                    )
                                }
                                pointCoordinates={linePointCoordinates}
                                line={selectedLine}
                                editing={isEditing}
                                disabled={saveDrafts.isPending}
                                onChange={changeLine}
                                onDeleteBranchPoint={removeBranchPoint}
                                onAddPoint={() => {
                                    if (!isEditing || saveDrafts.isPending)
                                        return
                                    try {
                                        if (!chartControls.current)
                                            throw new Error(
                                                'The chart is not ready.'
                                            )
                                        const coordinates =
                                            chartControls.current.getNewLinePointCoordinates(
                                                selectedLine.id
                                            )
                                        changeLine(
                                            insertLinePoint(
                                                selectedLine,
                                                selectedLine.points.length - 2,
                                                coordinates
                                            )
                                        )
                                    } catch (error) {
                                        console.error(
                                            'Failed to add line point',
                                            error
                                        )
                                        alert(
                                            `Point could not be added. ${parseErrorMessage(error)}`
                                        )
                                    }
                                }}
                                onDelete={() => {
                                    if (!isEditing || saveDrafts.isPending)
                                        return
                                    replaceLines(
                                        deleteBranch(
                                            chartLines,
                                            selectedLine.id,
                                            new Set(
                                                chartPositions.map(
                                                    ({ id }) => id
                                                )
                                            ),
                                            chartBranchPoints
                                        )
                                    )
                                    setSelectedLineId(null)
                                }}
                            />
                        )}
                        <div
                            className={styles.sidebarDetail}
                            hidden={!showPositionDetails}
                        >
                            <Form<Position>
                                controlsRef={formControls}
                                key={`${selectedPosition?.id}:${isEditing}:${editRevision}`}
                                initialSession={
                                    isEditing && selectedPosition
                                        ? {
                                              form:
                                                  getPositionDraft(
                                                      selectedPosition.id
                                                  ) ?? selectedPosition,
                                              mode:
                                                  selectedPosition.id < 0
                                                      ? 'create'
                                                      : 'edit',
                                          }
                                        : undefined
                                }
                                className={styles.positionForm}
                                form={selectedPosition}
                                title={
                                    formState?.mode == 'create'
                                        ? 'New Position'
                                        : (selectedPosition?.name ?? 'Position')
                                }
                                saving={saveDrafts.isPending}
                                onUpdate={onFormUpdate}
                                onSave={() => {
                                    saveDrafts.mutate()
                                    return false
                                }}
                                onCancel={() => {
                                    discardDrafts()
                                }}
                                showCreateButton={false}
                                onDelete={handleDelete}
                                deleteInEditMode
                                hideEditButton
                                hideSaveDiscard
                            >
                                <FormGroup title="Details">
                                    <TextField
                                        label="Name"
                                        field="name"
                                        required
                                    />
                                    <DropDownField<Position>
                                        label="Type"
                                        getter={(form) => form.type}
                                        setter={(form, field) => ({
                                            ...form,
                                            type: Number(field),
                                            seats:
                                                Number(field) ===
                                                PositionTypes.GROUP
                                                    ? 1
                                                    : form.type ===
                                                        PositionTypes.GROUP
                                                      ? Math.max(
                                                            1,
                                                            form.userIds.length
                                                        )
                                                      : form.seats,
                                        })}
                                        options={positionTypeOptions}
                                    />
                                    {!isGroup && (
                                        <NumberField
                                            label="Seats"
                                            field="seats"
                                            required
                                        />
                                    )}
                                    {detailPosition && (
                                        <GroupMembershipField
                                            positions={chartPositions}
                                            position={detailPosition}
                                        />
                                    )}
                                </FormGroup>
                                {(formState?.mode === 'create' ||
                                    selectedPosition) &&
                                    !isGroup &&
                                    seats > 0 && (
                                        <FormGroup title="People">
                                            <OccupantsField
                                                label="People"
                                                field="userIds"
                                                allUsers={knownUsers}
                                                onAssignUser={
                                                    rememberAssignedUser
                                                }
                                                userSearchQuery={
                                                    userSearchQuery
                                                }
                                                userSearch={userSearch}
                                                onUserSearch={onUserSearch}
                                                editing={
                                                    formState?.mode ===
                                                        'edit' ||
                                                    formState?.mode === 'create'
                                                }
                                            />
                                        </FormGroup>
                                    )}
                            </Form>
                            {detailPosition && (
                                <SubordinatesField
                                    key={detailPosition.id}
                                    position={detailPosition}
                                    positions={chartPositions}
                                    lines={chartLines}
                                    editing={isEditing}
                                    disabled={saveDrafts.isPending}
                                    onAdd={(id) => {
                                        if (!isEditing || saveDrafts.isPending)
                                            return
                                        if (
                                            detailPosition.type ===
                                            PositionTypes.GROUP
                                        ) {
                                            const member = positionById.get(id)
                                            if (!member) return
                                            const form = reparentPosition(
                                                chartPositions,
                                                member,
                                                detailPosition.id
                                            )
                                            replacePosition(form)
                                        } else {
                                            addLine(
                                                createLine(
                                                    {
                                                        positionId:
                                                            detailPosition.id,
                                                        handle: 'bottom',
                                                    },
                                                    {
                                                        positionId: id,
                                                        handle: 'top',
                                                    }
                                                )
                                            )
                                        }
                                    }}
                                    onRemove={(id) => {
                                        if (!isEditing || saveDrafts.isPending)
                                            return
                                        if (
                                            detailPosition.type ===
                                            PositionTypes.GROUP
                                        ) {
                                            const member = positionById.get(id)
                                            if (!member) return
                                            const form = reparentPosition(
                                                chartPositions,
                                                member,
                                                undefined
                                            )
                                            replacePosition(form)
                                        } else {
                                            const removed = new Set(
                                                chartLines.flatMap((line) => {
                                                    const { target } =
                                                        lineEndpoints(line)
                                                    return target.kind ===
                                                        'anchorpoint' &&
                                                        target.positionId === id
                                                        ? exclusiveSourceLines(
                                                              line,
                                                              chartLines,
                                                              detailPosition.id
                                                          )
                                                        : []
                                                })
                                            )
                                            replaceLines(
                                                chartLines.filter(
                                                    (line) =>
                                                        !removed.has(line.id)
                                                )
                                            )
                                        }
                                    }}
                                />
                            )}
                            {detailPosition && (
                                <section aria-label="Data model">
                                    <FormGroup title="Data model">
                                        <dl className={styles.dataModel}>
                                            {Object.entries({
                                                ID: detailPosition.id,
                                                Name: detailPosition.name,
                                                Type: `${positionTypeLabels[detailPosition.type]} (${detailPosition.type})`,
                                                X: detailPosition.coordinates
                                                    ? Math.round(
                                                          detailPosition
                                                              .coordinates.x
                                                      )
                                                    : '0 (canvas origin)',
                                                Y: detailPosition.coordinates
                                                    ? Math.round(
                                                          detailPosition
                                                              .coordinates.y
                                                      )
                                                    : '0 (canvas origin)',
                                                Seats:
                                                    detailPosition.seats ??
                                                    'null',
                                                'User IDs':
                                                    detailPosition.userIds.join(
                                                        ', '
                                                    ) || 'None',
                                                'Parent group':
                                                    detailPosition.parentGroupId ??
                                                    'None',
                                                'Line IDs':
                                                    chartLines
                                                        .filter((line) =>
                                                            line.points.some(
                                                                (point) =>
                                                                    point.kind ===
                                                                        'anchorpoint' &&
                                                                    point.positionId ===
                                                                        detailPosition.id
                                                            )
                                                        )
                                                        .map(({ id }) => id)
                                                        .join(', ') || 'None',
                                            }).map(([label, value]) => (
                                                <div key={label}>
                                                    <dt>{label}</dt>
                                                    <dd>{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <p className={styles.dataModelNote}>
                                            Cool text that I want to display
                                            here. That I need to actually make a
                                            component.
                                        </p>
                                    </FormGroup>
                                </section>
                            )}
                        </div>
                    </>
                }
            >
                <ChartCanvas
                    onMoveLinePoints={moveLinePoints}
                    onPasteSelection={pasteSelection}
                    onCutSelection={(ids) => {
                        deletePositions(ids)
                        setSelectedPosition(null)
                        setSelectedLineId(null)
                        setSelectedLinePoint(null)
                        setFormState(null)
                        setShowPositionDetails(false)
                    }}
                    showHitboxes={showHitboxes}
                    directionChevrons={directionChevrons}
                    pointCoordinates={linePointCoordinates}
                    onRemovePoint={(lineId, pointId, targetPointId) => {
                        if (!isEditing || saveDrafts.isPending) return
                        const line = chartLines.find(({ id }) => id === lineId)
                        const point = line?.points.find(
                            ({ id }) => id === pointId
                        )
                        if (!line || !point || point.kind === 'anchorpoint')
                            throw new Error(
                                'The dragged point is not removable.'
                            )
                        if (point.kind === 'branchpoint')
                            removeBranchPoint(pointId, targetPointId)
                        else
                            changeLine({
                                ...line,
                                points: line.points.filter(
                                    ({ id }) => id !== pointId
                                ),
                            })
                    }}
                    branchPoints={chartBranchPoints}
                    onChangeBranchPoint={(point) => {
                        if (!isEditing || saveDrafts.isPending) return
                        changeBranchPoint(point)
                    }}
                    onBranch={(lineId, pointId, targetId, handle) => {
                        if (!isEditing || saveDrafts.isPending) return
                        const parent = chartLines.find(
                            ({ id }) => id === lineId
                        )
                        if (
                            !parent?.points.some(
                                (point) =>
                                    point.id === pointId &&
                                    point.kind === 'branchpoint'
                            ) ||
                            !chartPositions.some(({ id }) => id === targetId)
                        ) {
                            console.error(
                                'Cannot create child line: missing branchpoint or target.'
                            )
                            alert(
                                'The branchpoint or target node is no longer available.'
                            )
                            return
                        }
                        const result = splitBranch(
                            chartLines,
                            lineId,
                            pointId,
                            {
                                positionId: targetId,
                                handle,
                            }
                        )
                        replaceLines(result.lines)
                        setSelectedLineId(result.child.id)
                    }}
                    onMergeBranch={(lineId, pointId, targetPointId) => {
                        if (!isEditing || saveDrafts.isPending) return
                        try {
                            const result = mergeBranch(
                                chartLines,
                                lineId,
                                pointId,
                                targetPointId
                            )
                            replaceLines(result.lines)
                            setSelectedLineId(result.child.id)
                        } catch (error) {
                            console.error('Failed to connect branch', error)
                            alert(
                                `The branch could not be connected. ${parseErrorMessage(error)}`
                            )
                        }
                    }}
                    onPointCoordinates={reportLinePointCoordinates}
                    controlsRef={chartControls}
                    editControls={{
                        isEditing,
                        isDirty:
                            (changedDrafts.length > 0 ||
                                deletedPositionIds.size > 0 ||
                                linesDirty) &&
                            changedDrafts.every(({ invalid }) => !invalid) &&
                            linesValid,
                        disabled:
                            saveDrafts.isPending || isLoading || !!storageError,
                        onEdit: () => {
                            if (
                                saveDrafts.isPending ||
                                isLoading ||
                                storageError
                            )
                                return
                            startEditing()
                            if (selectedPosition) setShowPositionDetails(true)
                        },
                        onSave: () => saveDrafts.mutate(),
                        onDiscard: discardDrafts,
                    }}
                    positions={chartPositions}
                    lines={renderedLines}
                    onChangeLine={changeLine}
                    selectedLineId={selectedLineId ?? undefined}
                    onSelectLine={(id) => {
                        if (saveDrafts.isPending) return
                        setSelectedLinePoint(null)
                        setSelectedLineId(id)
                        if (id) {
                            setSelectedPosition(null)
                            setFormState(null)
                            setShowPositionDetails(false)
                        }
                    }}
                    onSelectPoint={(lineId, pointId) => {
                        if (saveDrafts.isPending) return
                        setSelectedLineId(lineId)
                        setSelectedLinePoint({ lineId, pointId })
                        setSelectedPosition(null)
                        setFormState(null)
                        setShowPositionDetails(false)
                    }}
                    onConnectPositions={(sourceId, targetId, handles) => {
                        if (
                            !isEditing ||
                            saveDrafts.isPending ||
                            !canConnectPositions(
                                chartPositions,
                                sourceId,
                                targetId
                            )
                        )
                            return
                        const line = createLine(
                            {
                                positionId: sourceId,
                                handle: handles?.sourceHandle ?? 'bottom',
                            },
                            {
                                positionId: targetId,
                                handle: handles?.targetHandle ?? 'top',
                            }
                        )
                        addLine(line)
                        setSelectedLineId(line.id)
                        setSelectedPosition(null)
                        setFormState(null)
                        setShowPositionDetails(false)
                    }}
                    onGroupBoundsChange={resizeGroups}
                    onCoordinatesChange={movePosition}
                    users={knownUsers}
                    selectedPositionId={selectedPosition?.id}
                    onSelectPosition={(position) => {
                        if (handleSelectItem(position))
                            setShowPositionDetails(position !== null)
                    }}
                    isLoading={isLoading}
                    error={
                        storageError?.message ??
                        (assignedUsersError
                            ? `Assigned members could not be loaded. ${parseErrorMessage(assignedUsersError)}`
                            : null)
                    }
                />
                <div ref={setModalHost} className={styles.modalHost} />
            </Panel>
        </ChartModalHostContext.Provider>
    )
}
