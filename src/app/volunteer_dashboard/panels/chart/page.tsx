'use client'

import { ChartModalHostContext } from './ChartModalPortal'
import {
    Position,
    PositionTypes,
    UserProfile,
    type Line,
    type BranchPoint,
} from './api/domain/chart.types'
import { reparentPosition } from './api/domain/chartDocument.operations'
import {
    lineError,
    lineEndpoints,
    usedBranchPoints,
    exclusiveSourceLines,
} from './api/domain/lineGraph'
import {
    createLine,
    splitBranch,
    mergeBranch,
    deleteBranch,
    deleteBranchPoint,
    simplifyLines,
    convertLinePoint,
} from './api/domain/lineOperations'
import { useChartEditor } from './api/editor/useChartEditor'
import { ChartCanvas, type ChartCanvasHandle } from './canvas/ChartCanvas'
import type {
    DirectionChevronMode,
    LinePointCoordinates,
} from './canvas/LineEditingContext'
import { insertLinePoint } from './canvas/linePoints'
import { canConnectPositions } from './canvas/positions.connections'
import {
    ChartTooltip,
    type ChartTooltipAction,
    type FlowAnchor,
} from './canvas/tooltip/ChartTooltip'
import styles from './page.module.css'
import { GroupMembershipField } from './sidebar/GroupMembershipField'
import { LineDetails } from './sidebar/LineDetails'
import { OccupantsField } from './sidebar/OccupantsField'
import { PermissionsField } from './sidebar/PermissionsField'
import { PositionLinesField } from './sidebar/PositionLinesField'
import { SidebarFilterTags } from './sidebar/SidebarFilterTags'
import { SubordinatesField } from './sidebar/SubordinatesField'
import {
    positionTypeOptions,
    positionTypeLabels,
    getPositionListChildren,
    positionListItem,
} from './sidebar/positions.list'
import { BackButton } from '@/components/common/buttons'
import { Form, FormState } from '@/components/common/forms'
import type { FormControls } from '@/components/common/forms/Form'
import { ClonePlusIcon } from '@/components/common/icons/ClonePlusIcon'
import {
    DropdownRow,
    List,
    ListRow,
    StepperRow,
    TextRow,
} from '@/components/common/list'
import { SidebarHeaderButton } from '@/components/common/navigation_stack/sidebar/Sidebar'
import Panel from '@/components/common/panel/Panel'
import { ProtectedPanel } from '@/components/common/panel/ProtectedPanel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { type SidebarListFiltersProps } from '@/components/common/panel/sidebar_list/SidebarList'
import { PermissionIds } from '@/models'
import { parseErrorMessage } from '@/util'
import {
    useAssignedUsers,
    usePaginatedSearch,
    useUnpaginatedSearch,
} from '@/util/hooks'
import deepEqual from 'deep-equal'
import { zUserProfile } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaInfinity, FaUserEdit } from 'react-icons/fa'
import {
    FaCodeMerge,
    FaMinus,
    FaPencil,
    FaPlus,
    FaRegPenToSquare,
} from 'react-icons/fa6'

const blankPosition: Position = {
    id: -1,
    name: '',
    coordinates: { x: 0, y: 0 },
    userIds: [],
    type: PositionTypes.POSITION,
    seats: 1,
    permissions: [],
}

export default function Page() {
    const chartControls = useRef<ChartCanvasHandle>(null)
    const formControls = useRef<FormControls<Position>>(null)

    const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
    const [placingPointLineId, setPlacingPointLineId] = useState<string | null>(
        null
    )
    const placingPoint =
        placingPointLineId !== null && placingPointLineId === selectedLineId
    const [drawingBranchPointId, setDrawingBranchPointId] = useState<
        string | null
    >(null)
    const [revertOnCancel, setRevertOnCancel] = useState(false)
    useEffect(() => {
        if (!placingPoint) return
        const cancel = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPlacingPointLineId(null)
        }
        window.addEventListener('keydown', cancel)
        return () => window.removeEventListener('keydown', cancel)
    }, [placingPoint])
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

    const [showHitboxes, setShowHitboxes] = useState(false)
    const [directionChevrons, setDirectionChevrons] =
        useState<DirectionChevronMode>('merges')

    const {
        chartBranchPoints,
        isLoading,
        loadError,
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
        changePointGroups,
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

    const applyLine = (line: Line, branchPoints?: BranchPoint[]) => {
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
    const changeLine = (line: Line, branchPoints?: BranchPoint[]) => {
        if (!isEditing || saveDrafts.isPending) return
        applyLine(line, branchPoints)
    }
    const removeBranchPoint = (id: string, targetPointId?: string) => {
        if (!isEditing || saveDrafts.isPending) return
        deleteBranchPointNow(id, targetPointId)
    }
    const deleteBranchPointNow = (id: string, targetPointId?: string) => {
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
        if (saveDrafts.isPending || isLoading || loadError) return
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

    const seats = (formState?.form ?? selectedPosition)?.seats
    const isGroup =
        (formState?.form.type ?? selectedPosition?.type) === PositionTypes.GROUP

    const deletePosition = (id: number) => {
        if (saveDrafts.isPending) return
        deletePositions([id])
        if (selectedPosition?.id !== id) return
        setSelectedPosition(null)
        setFormState(null)
        setShowPositionDetails(false)
    }

    const handleDelete = () => {
        if (selectedPosition) deletePosition(selectedPosition.id)
    }

    const openDetails = (id: number) => {
        const position = positionById.get(id)
        if (position && handleSelectItem(position)) setShowPositionDetails(true)
    }

    const changeSeats = (id: number, delta: number) => {
        const position = getPositionDraft(id) ?? positionById.get(id)
        if (typeof position?.seats !== 'number') return
        const next = { ...position, seats: position.seats + delta }
        replacePosition(next)
        if (selectedPosition?.id === id) formControls.current?.update(next)
    }

    const editAction = (action: () => void) => () => {
        if (saveDrafts.isPending) return
        if (!isEditing) startEditing()
        action()
    }

    const positionTooltip = (
        id: number,
        { duplicate }: { duplicate: () => void }
    ) => {
        const position = getPositionDraft(id) ?? positionById.get(id)
        if (!position) return null
        const actions: ChartTooltipAction[] = [
            {
                key: 'duplicate',
                label: 'Duplicate',
                icon: <ClonePlusIcon size={20} />,
                onClick: editAction(duplicate),
            },
        ]
        if (position.type !== PositionTypes.GROUP)
            actions.push({
                key: 'assign',
                label: 'Assign Person',
                icon: <FaUserEdit size={20} />,
                onClick: editAction(() => openDetails(id)),
            })
        actions.push({
            key: 'edit',
            label: 'Edit Position',
            icon: <FaPencil size={20} />,
            onClick: editAction(() => openDetails(id)),
        })
        if (typeof position.seats === 'number')
            actions.push(
                {
                    key: 'add-seat',
                    label: 'Add Seat',
                    icon: <FaPlus size={20} />,
                    onClick: editAction(() => changeSeats(id, 1)),
                },
                {
                    key: 'remove-seat',
                    label: 'Remove Seat',
                    icon: <FaMinus size={20} />,
                    onClick: editAction(() => changeSeats(id, -1)),
                    disabled:
                        position.seats <= Math.max(1, position.userIds.length),
                }
            )
        return (
            <ChartTooltip
                id={String(id)}
                actions={actions}
                onDelete={editAction(() => deletePosition(id))}
            />
        )
    }

    const addLinePoint = (line: Line) => {
        try {
            if (!chartControls.current)
                throw new Error('The chart is not ready.')
            const coordinates =
                chartControls.current.getNewLinePointCoordinates(line.id)
            applyLine(
                insertLinePoint(
                    line,
                    line.points.length - 2,
                    coordinates,
                    chartControls.current.groupAt(coordinates)
                )
            )
        } catch (error) {
            console.error('Failed to add line point', error)
            alert(`Point could not be added. ${parseErrorMessage(error)}`)
        }
    }

    const deleteLine = (line: Line) => {
        replaceLines(
            deleteBranch(
                chartLines,
                line.id,
                new Set(chartPositions.map(({ id }) => id)),
                chartBranchPoints
            )
        )
        setSelectedLineId(null)
    }

    const lineTooltip = (lineId: string, at: FlowAnchor) => {
        const line = chartLines.find(({ id }) => id === lineId)
        if (!line) return null
        return (
            <ChartTooltip
                id={`line:${lineId}`}
                at={at}
                actions={[
                    {
                        key: 'add-point',
                        label: 'Add Point',
                        icon: <FaPlus size={20} />,
                        selected: placingPoint,
                        onClick: editAction(() =>
                            setPlacingPointLineId(placingPoint ? null : lineId)
                        ),
                    },
                ]}
                onDelete={editAction(() => deleteLine(line))}
            />
        )
    }

    const pointTooltip = (lineId: string, pointId: string, at: FlowAnchor) => {
        const line = chartLines.find(({ id }) => id === lineId)
        const point = line?.points.find(({ id }) => id === pointId)
        if (!line || !point || point.kind === 'anchorpoint') return null
        if (drawingBranchPointId === pointId) return null
        const toBranchpoint = point.kind === 'waypoint'
        const convert = () => {
            const result = convertLinePoint(
                line,
                pointId,
                'branchpoint',
                chartBranchPoints
            )
            applyLine(result.line, result.branchPoints)
        }
        return (
            <ChartTooltip
                id={`point:${pointId}`}
                at={at}
                actions={[
                    {
                        key: 'branch',
                        label: 'Draw Branch',
                        icon: <FaCodeMerge size={20} />,
                        onClick: editAction(() => {
                            if (toBranchpoint) convert()
                            setDrawingBranchPointId(pointId)
                            setRevertOnCancel(toBranchpoint)
                        }),
                    },
                ]}
                onDelete={editAction(() => {
                    setSelectedLinePoint(null)
                    if (point.kind === 'branchpoint')
                        deleteBranchPointNow(pointId)
                    else
                        applyLine({
                            ...line,
                            points: line.points.filter(
                                ({ id }) => id !== pointId
                            ),
                        })
                })}
            />
        )
    }

    const closeDetails = () => {
        setShowPositionDetails(false)
        setSelectedLineId(null)
    }

    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        showSort: true,
        showLimit: false,
    }

    return (
        <ProtectedPanel
            label="Chart"
            requiredPermissions={[PermissionIds.VIEW_POSITIONS_PANEL]}
        >
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
                    showScrollbar={false}
                    sidebarList={
                        showPositionDetails || selectedLine
                            ? undefined
                            : {
                                  search: { search, onSearch },
                                  filters: sidebarFilters,
                              }
                    }
                    prominentHeaderRight={
                        <>
                            <SidebarHeaderButton
                                icon={<FaRegPenToSquare size={20} />}
                                label="Create Position"
                                onClick={() => {
                                    handleCreate()
                                }}
                            />
                            <SidebarHeaderButton
                                icon={<ClonePlusIcon size={20} />}
                                label="Create Group"
                            />
                        </>
                    }
                    sidebarBody={
                        <>
                            {invalidLine &&
                                invalidLine.id !== selectedLineId && (
                                    <p role="alert">
                                        Line {invalidLine.id}:{' '}
                                        {lineError(invalidLine)}
                                    </p>
                                )}
                            <div hidden={showPositionDetails || !!selectedLine}>
                                <div className={styles.filterTagsWrapper}>
                                    <SidebarFilterTags
                                        positions={chartPositions}
                                    />
                                </div>
                                <SidebarBody<Position>
                                    items={positions}
                                    isLoading={isLoading}
                                    error={loadError}
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
                                    positions={chartPositions}
                                    branchPoints={chartBranchPoints}
                                    usedBranchPoints={
                                        new Set(
                                            chartLines.flatMap((line) =>
                                                line.points.flatMap((point) =>
                                                    point.kind ===
                                                        'branchpoint' &&
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
                                    onChangePointGroup={(
                                        pointId,
                                        parentGroupId
                                    ) =>
                                        changePointGroups({
                                            [pointId]: parentGroupId,
                                        })
                                    }
                                    onDeleteBranchPoint={removeBranchPoint}
                                    onAddPoint={() => {
                                        if (!isEditing || saveDrafts.isPending)
                                            return
                                        addLinePoint(selectedLine)
                                    }}
                                    onDelete={() => {
                                        if (!isEditing || saveDrafts.isPending)
                                            return
                                        deleteLine(selectedLine)
                                    }}
                                    onBack={closeDetails}
                                />
                            )}
                            <div
                                className={styles.sidebarDetail}
                                hidden={!showPositionDetails}
                            >
                                <BackButton
                                    label="Back To Positions"
                                    onClick={closeDetails}
                                />
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
                                            : (selectedPosition?.name ??
                                              'Position')
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
                                    <List title="Details">
                                        <TextRow
                                            label="Name"
                                            field="name"
                                            indicator="required"
                                        />
                                        <DropdownRow
                                            label="Type"
                                            getter={(form: Position) =>
                                                form.type
                                            }
                                            setter={(
                                                form: Position,
                                                field
                                            ) => ({
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
                                                                form.userIds
                                                                    .length
                                                            )
                                                          : form.seats,
                                            })}
                                            options={positionTypeOptions}
                                        />
                                        {!isGroup && (
                                            <StepperRow
                                                label="Seats"
                                                field="seats"
                                                min={0}
                                                nullLabel="Uncapped"
                                                nullIcon={
                                                    <FaInfinity aria-hidden="true" />
                                                }
                                                setter={(
                                                    form: Position,
                                                    value
                                                ) => ({
                                                    ...form,
                                                    seats:
                                                        value === 0
                                                            ? null
                                                            : (value ?? null),
                                                })}
                                            />
                                        )}
                                        {detailPosition && (
                                            <GroupMembershipField
                                                positions={chartPositions}
                                                position={detailPosition}
                                            />
                                        )}
                                    </List>
                                    {(formState?.mode === 'create' ||
                                        selectedPosition) &&
                                        !isGroup &&
                                        (seats == null || seats > 0) && (
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
                                        )}
                                    {detailPosition && (
                                        <div>
                                            <SubordinatesField
                                                key={detailPosition.id}
                                                position={detailPosition}
                                                positions={chartPositions}
                                                lines={chartLines}
                                                editing={isEditing}
                                                disabled={saveDrafts.isPending}
                                                onAdd={(id) => {
                                                    if (
                                                        !isEditing ||
                                                        saveDrafts.isPending
                                                    )
                                                        return
                                                    if (
                                                        detailPosition.type ===
                                                        PositionTypes.GROUP
                                                    ) {
                                                        const member =
                                                            positionById.get(id)
                                                        if (!member) return
                                                        const form =
                                                            reparentPosition(
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
                                                                    positionId:
                                                                        id,
                                                                    handle: 'top',
                                                                }
                                                            )
                                                        )
                                                    }
                                                }}
                                                onRemove={(id) => {
                                                    if (
                                                        !isEditing ||
                                                        saveDrafts.isPending
                                                    )
                                                        return
                                                    if (
                                                        detailPosition.type ===
                                                        PositionTypes.GROUP
                                                    ) {
                                                        const member =
                                                            positionById.get(id)
                                                        if (!member) return
                                                        const form =
                                                            reparentPosition(
                                                                chartPositions,
                                                                member,
                                                                undefined
                                                            )
                                                        replacePosition(form)
                                                    } else {
                                                        const removed = new Set(
                                                            chartLines.flatMap(
                                                                (line) => {
                                                                    const {
                                                                        target,
                                                                    } =
                                                                        lineEndpoints(
                                                                            line
                                                                        )
                                                                    return target.kind ===
                                                                        'anchorpoint' &&
                                                                        target.positionId ===
                                                                            id
                                                                        ? exclusiveSourceLines(
                                                                              line,
                                                                              chartLines,
                                                                              detailPosition.id
                                                                          )
                                                                        : []
                                                                }
                                                            )
                                                        )
                                                        replaceLines(
                                                            chartLines.filter(
                                                                (line) =>
                                                                    !removed.has(
                                                                        line.id
                                                                    )
                                                            )
                                                        )
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                    {(formState?.mode === 'create' ||
                                        selectedPosition) &&
                                        !isGroup && <PermissionsField />}
                                </Form>
                                {detailPosition && !isGroup && (
                                    <PositionLinesField
                                        position={detailPosition}
                                        positions={chartPositions}
                                        lines={chartLines}
                                        onSelectLine={(id) => {
                                            if (saveDrafts.isPending) return
                                            setSelectedLinePoint(null)
                                            setSelectedLineId(id)
                                            setSelectedPosition(null)
                                            setFormState(null)
                                            setShowPositionDetails(false)
                                        }}
                                    />
                                )}
                                {detailPosition && (
                                    <List
                                        title="Data model"
                                        disclaimer="Cool text that I want to display here. That I need to actually make a component."
                                    >
                                        {Object.entries({
                                            ID: detailPosition.id,
                                            Name: detailPosition.name,
                                            Type: `${positionTypeLabels[detailPosition.type]} (${detailPosition.type})`,
                                            X: detailPosition.coordinates
                                                ? Math.round(
                                                      detailPosition.coordinates
                                                          .x
                                                  )
                                                : '0 (canvas origin)',
                                            Y: detailPosition.coordinates
                                                ? Math.round(
                                                      detailPosition.coordinates
                                                          .y
                                                  )
                                                : '0 (canvas origin)',
                                            Seats:
                                                detailPosition.seats ?? 'null',
                                            'User IDs':
                                                detailPosition.userIds.join(
                                                    ', '
                                                ) || 'None',
                                            Permissions:
                                                detailPosition.permissions
                                                    .map(
                                                        ({ id, name }) =>
                                                            `${name} (${id})`
                                                    )
                                                    .join(', ') || 'None',
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
                                            <ListRow
                                                key={label}
                                                label={label}
                                                value={value}
                                            />
                                        ))}
                                    </List>
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
                            const line = chartLines.find(
                                ({ id }) => id === lineId
                            )
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
                                !chartPositions.some(
                                    ({ id }) => id === targetId
                                )
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
                                changedDrafts.every(
                                    ({ invalid }) => !invalid
                                ) &&
                                linesValid,
                            disabled:
                                saveDrafts.isPending ||
                                isLoading ||
                                !!loadError,
                            onEdit: () => {
                                if (
                                    saveDrafts.isPending ||
                                    isLoading ||
                                    loadError
                                )
                                    return
                                startEditing()
                                if (selectedPosition)
                                    setShowPositionDetails(true)
                            },
                            onSave: () => saveDrafts.mutate(),
                            onDiscard: discardDrafts,
                        }}
                        positions={chartPositions}
                        lines={renderedLines}
                        onChangeLine={changeLine}
                        selectedLineId={selectedLineId ?? undefined}
                        selectedPointId={selectedLinePoint?.pointId}
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
                        onPointGroupsChange={changePointGroups}
                        onRegroup={(id, parentGroupId, coordinates) => {
                            if (!isEditing || saveDrafts.isPending) return
                            const position =
                                getPositionDraft(id) ?? positionById.get(id)
                            if (!position) return
                            const next = {
                                ...position,
                                parentGroupId,
                                coordinates,
                            }
                            replacePosition(next)
                            if (selectedPosition?.id === id)
                                formControls.current?.update(next)
                        }}
                        users={knownUsers}
                        renderTooltip={positionTooltip}
                        renderLineTooltip={lineTooltip}
                        renderPointTooltip={pointTooltip}
                        drawingBranchPointId={drawingBranchPointId}
                        onBranchDrawn={(completed) => {
                            const line = chartLines.find(({ points }) =>
                                points.some(
                                    ({ id, kind }) =>
                                        id === drawingBranchPointId &&
                                        kind === 'branchpoint'
                                )
                            )
                            if (
                                !completed &&
                                revertOnCancel &&
                                line &&
                                drawingBranchPointId
                            ) {
                                const result = convertLinePoint(
                                    line,
                                    drawingBranchPointId,
                                    'waypoint',
                                    chartBranchPoints
                                )
                                applyLine(result.line, result.branchPoints)
                            }
                            setDrawingBranchPointId(null)
                            setRevertOnCancel(false)
                        }}
                        placingPointLineId={
                            placingPoint ? selectedLineId : null
                        }
                        onPointPlaced={() => setPlacingPointLineId(null)}
                        selectedPositionId={selectedPosition?.id}
                        onSelectPosition={(position) => {
                            if (handleSelectItem(position))
                                setShowPositionDetails(position !== null)
                        }}
                        isLoading={isLoading}
                        error={
                            loadError?.message ??
                            (assignedUsersError
                                ? `Assigned members could not be loaded. ${parseErrorMessage(assignedUsersError)}`
                                : null)
                        }
                    />
                    <div ref={setModalHost} className={styles.modalHost} />
                </Panel>
            </ChartModalHostContext.Provider>
        </ProtectedPanel>
    )
}
