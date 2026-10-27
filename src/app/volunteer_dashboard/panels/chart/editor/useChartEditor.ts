'use client'

import {
    pasteChartSelection,
    type ChartClipboard,
} from '../canvas/chartClipboard'
import type {
    Position,
    Line,
    BranchPoint,
    GroupBounds,
} from '../domain/chart.types'
import {
    saveLocalChart,
    removeDeletedPositionsAndUngroup,
} from '../domain/chartDocument.operations'
import { lineError } from '../domain/lineGraph'
import { simplifyLines } from '../domain/lineOperations'
import { readLocalChart, writeLocalChart } from '../storage/chart.storage'
import {
    chartEditorReducer,
    createChartEditorState,
} from './chartEditor.reducer'
import type { FormState } from '@/components/common/forms'
import { parseErrorMessage } from '@/util'
import { useMutation } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { useCallback, useEffect, useMemo, useRef, useReducer } from 'react'

interface ChartEditorOptions {
    onSaved: (saved: ReturnType<typeof saveLocalChart>) => void
    onSaveSuccess: () => void
    onDiscard: (positions: Position[]) => void
}

export function useChartEditor({
    onSaved,
    onSaveSuccess,
    onDiscard,
}: ChartEditorOptions) {
    const [state, dispatch] = useReducer(
        chartEditorReducer,
        undefined,
        createChartEditorState
    )
    const {
        saved,
        drafts,
        lineDrafts,
        branchPointDrafts,
        deletedPositionIds,
        isLoading,
        storageError,
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

    useEffect(() => {
        try {
            dispatch({ type: 'loadSucceeded', document: readLocalChart() })
        } catch (error) {
            console.error('Failed to load local chart', error)
            dispatch({
                type: 'loadFailed',
                error: new Error(
                    `Local chart could not be loaded. ${parseErrorMessage(error)}`
                ),
            })
        }
    }, [])

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
        (line: Line) => dispatch({ type: 'lineAdded', line }),
        []
    )
    const changeBranchPoint = useCallback(
        (point: BranchPoint) => dispatch({ type: 'branchPointChanged', point }),
        []
    )
    const moveLinePoints = (
        coordinates: Record<string, { x: number; y: number }>
    ) => {
        if (!isEditing || saveDrafts.isPending) return
        dispatch({ type: 'linePointsMoved', coordinates })
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
        mutationFn: () => {
            if (storageError) throw storageError
            if (isLoading) throw new Error('Local positions are still loading.')
            if (!linesValid || changedDrafts.some(({ invalid }) => invalid))
                throw new Error('Correct invalid fields before saving.')
            const saved = saveLocalChart(
                {
                    version: 5,
                    positions: allPositions,
                    lines: allLines,
                    branchPoints: allBranchPoints,
                },
                Object.values(drafts).map(({ form }) => form),
                deletedPositionIds,
                chartLines,
                chartBranchPoints
            )
            writeLocalChart(saved.document)
            return Promise.resolve(saved)
        },
        onSuccess: (saved) => {
            dispatch({ type: 'saveSucceeded', document: saved.document })
            onSaved(saved)
            onSaveSuccess()
        },
        onError: (error) => {
            console.error(error)
            alert(
                `Local changes could not be saved. ${parseErrorMessage(error)}`
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
