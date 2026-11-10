'use client'

import {
    pasteChartSelection,
    type ChartClipboard,
} from '../../canvas/chartClipboard'
import {
    EMPTY_CHART,
    type ChartDocument,
    type Position,
    type Line,
    type BranchPoint,
    type GroupBounds,
} from '../domain/chart.types'
import {
    applyChartDrafts,
    mergeChartWithPositions,
    removeDeletedPositionsAndUngroup,
} from '../domain/chartDocument.operations'
import { lineError } from '../domain/lineGraph'
import { simplifyLines } from '../domain/lineOperations'
import {
    ORG_CHART_QUERY_KEY,
    useOrgChartQueries,
} from '../storage/chart.queries'
import {
    chartEditorReducer,
    createChartEditorState,
} from './chartEditor.reducer'
import type { FormState } from '@/components/common/forms'
import { usePositionQueries } from '@/queries'
import { parseErrorMessage } from '@/util'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import type { PositionHierarchyResponse } from 'pv-contracts/responses'
import { useCallback, useMemo, useRef, useReducer } from 'react'

export interface SavedChart {
    document: ChartDocument
    createdIds: ReadonlyMap<number, number>
}

interface ChartEditorOptions {
    onSaved: (saved: SavedChart) => void
    onSaveSuccess: () => void
    onDiscard: (positions: Position[]) => void
}

const POSITION_HIERARCHY_QUERY_KEY = ['positionHierarchy']

const positionRecord = ({
    name,
    type,
    seats,
    userIds,
    permissions,
}: Pick<Position, 'name' | 'type' | 'seats' | 'userIds' | 'permissions'>) => ({
    name,
    type,
    seats,
    userIds,
    permissions,
})

export function useChartEditor({
    onSaved,
    onSaveSuccess,
    onDiscard,
}: ChartEditorOptions) {
    const queryClient = useQueryClient()
    const positionQueries = usePositionQueries()
    const { ready, getOrgChart, saveOrgChart } = useOrgChartQueries()
    const hierarchyQuery = useQuery({
        queryKey: POSITION_HIERARCHY_QUERY_KEY,
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })
    const chartQuery = useQuery({
        queryKey: ORG_CHART_QUERY_KEY,
        queryFn: getOrgChart,
        enabled: ready,
    })
    const saved = useMemo(
        () =>
            hierarchyQuery.data && chartQuery.data
                ? mergeChartWithPositions(
                      chartQuery.data,
                      hierarchyQuery.data.positions
                  )
                : EMPTY_CHART,
        [hierarchyQuery.data, chartQuery.data]
    )
    const isLoading = hierarchyQuery.isPending || chartQuery.isPending
    const loadError = hierarchyQuery.error ?? chartQuery.error
    const [state, dispatch] = useReducer(
        chartEditorReducer,
        undefined,
        createChartEditorState
    )
    const {
        drafts,
        lineDrafts,
        branchPointDrafts,
        deletedPositionIds,
        isEditing,
        editRevision,
    } = state
    const {
        positions: allPositions,
        lines: allLines,
        branchPoints: allBranchPoints,
    } = saved
    const chartBranchPoints = branchPointDrafts ?? allBranchPoints
    const nextDraftId = useRef(-1)

    const startEditing = useCallback(
        () => dispatch({ type: 'editingChanged', editing: true }),
        []
    )
    const createPosition = (
        template: Position,
        coordinates: Position['coordinates']
    ) => {
        const position = { ...template, id: nextDraftId.current--, coordinates }
        dispatch({ type: 'positionCreated', position })
        return position
    }
    const replacePosition = useCallback(
        (position: Position) =>
            dispatch({ type: 'positionReplaced', position }),
        []
    )
    const deletePositions = useCallback(
        (ids: number[]) => dispatch({ type: 'positionsDeleted', ids }),
        []
    )
    const replaceLines = useCallback(
        (lines: Line[]) => dispatch({ type: 'linesReplaced', lines }),
        []
    )
    const addLine = useCallback(
        (line: Line) =>
            dispatch({ type: 'lineAdded', line, savedLines: allLines }),
        [allLines]
    )
    const changeBranchPoint = useCallback(
        (point: BranchPoint) =>
            dispatch({
                type: 'branchPointChanged',
                point,
                savedBranchPoints: allBranchPoints,
            }),
        [allBranchPoints]
    )
    const moveLinePoints = (
        coordinates: Record<string, { x: number; y: number }>
    ) => {
        if (!isEditing || saveDrafts.isPending) return
        dispatch({
            type: 'linePointsMoved',
            coordinates,
            savedLines: allLines,
            savedBranchPoints: allBranchPoints,
        })
    }
    const updateLineGraph = useCallback(
        (lines: Line[], branchPoints: BranchPoint[]) =>
            dispatch({ type: 'lineGraphChanged', lines, branchPoints }),
        []
    )
    const updatePositionDraft = useCallback(
        (form: FormState<Position>) =>
            dispatch({ type: 'positionChanged', form }),
        []
    )

    const chartPositions = useMemo(
        () =>
            removeDeletedPositionsAndUngroup(
                [
                    ...allPositions,
                    ...Object.values(drafts).map(({ form }) => form),
                ],
                deletedPositionIds
            ),
        [allPositions, drafts, deletedPositionIds]
    )

    const chartLines = useMemo(
        () =>
            simplifyLines(
                lineDrafts ?? allLines,
                new Set(chartPositions.map(({ id }) => id)),
                chartBranchPoints
            ),
        [lineDrafts, allLines, chartPositions, chartBranchPoints]
    )

    const linesDirty =
        !deepEqual(chartLines, allLines) ||
        !deepEqual(chartBranchPoints, allBranchPoints)

    const linesValid = chartLines.every((line) => !lineError(line))

    const invalidLine = chartLines.find((line) => lineError(line))

    const renderedLines = useMemo(
        () => chartLines.filter((line) => !lineError(line)),
        [chartLines]
    )

    const changedDrafts = Object.values(drafts).filter(
        ({ form }) =>
            !deletedPositionIds.has(form.id) &&
            (form.id < 0 ||
                !deepEqual(
                    form,
                    allPositions.find(({ id }) => id === form.id)
                ))
    )

    const discardDrafts = () => {
        dispatch({ type: 'discard' })
        onDiscard(allPositions)
    }

    const saveDrafts = useMutation({
        mutationFn: async (): Promise<SavedChart> => {
            if (loadError) throw loadError
            if (isLoading) throw new Error('The chart is still loading.')
            if (!linesValid || changedDrafts.some(({ invalid }) => invalid))
                throw new Error('Correct invalid fields before saving.')
            const forms = Object.values(drafts).map(({ form }) => form)
            const created = await Promise.all(
                forms
                    .filter(({ id }) => id < 0 && !deletedPositionIds.has(id))
                    .map(async (position) => ({
                        draftId: position.id,
                        record: await positionQueries.createPosition({
                            name: position.name,
                            parentRelationships: [],
                            positionType: position.type,
                            seats: position.seats,
                            permission: position.permissions,
                        }),
                    }))
            )
            const createdIds = new Map(
                created.map(({ draftId, record }) => [draftId, record.id])
            )
            const document = applyChartDrafts(
                saved,
                forms,
                deletedPositionIds,
                createdIds,
                chartLines,
                chartBranchPoints
            )
            const remote = new Map(
                [
                    ...saved.positions,
                    ...created.map(({ record }) => record),
                ].map((position) => [position.id, positionRecord(position)])
            )
            await Promise.all(
                document.positions
                    .filter(
                        (position) =>
                            !deepEqual(
                                positionRecord(position),
                                remote.get(position.id)
                            )
                    )
                    .map(({ id, name, type, seats, userIds, permissions }) =>
                        positionQueries.updatePosition(id, {
                            name,
                            positionType: type,
                            seats,
                            userIds,
                            permissions,
                        })
                    )
            )
            await Promise.all(
                [...deletedPositionIds]
                    .filter((id) => remote.has(id))
                    .map((id) => positionQueries.deletePosition(id))
            )
            await saveOrgChart(document)
            return { document, createdIds }
        },
        onSuccess: (result) => {
            queryClient.setQueryData(ORG_CHART_QUERY_KEY, result.document)
            queryClient.setQueryData(
                POSITION_HIERARCHY_QUERY_KEY,
                (res?: PositionHierarchyResponse) =>
                    res && {
                        ...res,
                        positions: result.document.positions.map(
                            ({
                                id,
                                name,
                                type,
                                seats,
                                userIds,
                                permissions,
                            }) => ({
                                id,
                                name,
                                type,
                                seats,
                                userIds,
                                permissions,
                                childRelationships:
                                    res.positions.find(
                                        (position) => position.id === id
                                    )?.childRelationships ?? [],
                            })
                        ),
                    }
            )
            void queryClient.invalidateQueries({
                queryKey: POSITION_HIERARCHY_QUERY_KEY,
            })
            dispatch({ type: 'saveSucceeded' })
            onSaved(result)
            onSaveSuccess()
        },
        onError: (error) => {
            console.error(error)
            void queryClient.invalidateQueries({
                queryKey: POSITION_HIERARCHY_QUERY_KEY,
            })
            alert(
                `Chart changes could not be saved. ${parseErrorMessage(error)}`
            )
        },
    })
    const pasteSelection = (
        clipboard: ChartClipboard,
        at: { x: number; y: number }
    ) => {
        const pasted = pasteChartSelection(
            clipboard,
            at,
            () => nextDraftId.current--
        )
        dispatch({
            type: 'selectionPasted',
            positions: pasted.positions,
            lines: [...chartLines, ...pasted.lines],
            branchPoints: [...chartBranchPoints, ...pasted.branchPoints],
        })
        return pasted
    }
    const movePosition = (
        id: number,
        coordinates: NonNullable<Position['coordinates']>
    ) => {
        const position = chartPositions.find((position) => position.id === id)
        if (!position || !isEditing) return
        dispatch({ type: 'positionMoved', position, coordinates })
    }
    const resizeGroups = (bounds: Map<number, GroupBounds>) => {
        if (!isEditing || saveDrafts.isPending) return
        const groups: { position: Position; bounds: GroupBounds }[] = []
        for (const [id, groupBounds] of bounds) {
            const position =
                drafts[id]?.form ??
                chartPositions.find((item) => item.id === id)
            if (!position || deepEqual(position.groupBounds, groupBounds))
                continue
            groups.push({ position, bounds: groupBounds })
        }
        dispatch({ type: 'groupsResized', groups })
    }
    return {
        getPositionDraft: (id: number) => drafts[id]?.form,
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
        replacePosition,
        deletePositions,
        replaceLines,
        addLine,
        changeBranchPoint,
        moveLinePoints,
        pasteSelection,
        movePosition,
        resizeGroups,
    }
}
