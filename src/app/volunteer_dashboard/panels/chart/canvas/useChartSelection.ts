'use client'

import type { Node, OnEdgesChange } from '@xyflow/react'
import { useCallback, useState } from 'react'

interface ChartNodeSelection {
    anchor: number | undefined
    ids: Set<string>
}

export function useChartSelection(selectedPositionId?: number) {
    const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set())
    const [nodeSelection, setNodeSelection] = useState<ChartNodeSelection>({
        anchor: selectedPositionId,
        ids: new Set(
            selectedPositionId === undefined ? [] : [String(selectedPositionId)]
        ),
    })

    const onEdgesChange: OnEdgesChange = useCallback((changes) => {
        setSelectedEdges((previous) => {
            const next = new Set(previous)
            for (const change of changes) {
                if (change.type === 'select') {
                    if (change.selected) next.add(change.id)
                    else next.delete(change.id)
                } else if (change.type === 'remove') {
                    next.delete(change.id)
                }
            }
            return next
        })
    }, [])

    const selectNode = useCallback((id: string, anchor?: number) => {
        setNodeSelection({ anchor, ids: new Set([id]) })
    }, [])

    const selectNodes = useCallback(
        (ids: Iterable<string>, anchor = selectedPositionId) => {
            setNodeSelection({ anchor, ids: new Set(ids) })
        },
        [selectedPositionId]
    )

    const selectPastedNodes = useCallback(
        (ids: Iterable<string>) => selectNodes(ids),
        [selectNodes]
    )

    const clearNodeSelection = useCallback(
        () => setNodeSelection({ anchor: undefined, ids: new Set() }),
        []
    )

    const clearSelectedEdges = useCallback(
        () => setSelectedEdges(new Set()),
        []
    )

    const selectEdge = useCallback(
        (id: string) => setSelectedEdges(new Set([id])),
        []
    )

    const recordNodeSelection = useCallback(
        (nodes: Node[]) => {
            setNodeSelection({
                anchor: selectedPositionId,
                ids: new Set(
                    nodes.filter((node) => node.selected).map(({ id }) => id)
                ),
            })
        },
        [selectedPositionId]
    )

    const isNodeSelected = useCallback(
        (id: string) =>
            nodeSelection.anchor === selectedPositionId
                ? nodeSelection.ids.has(id)
                : Number(id) === selectedPositionId,
        [nodeSelection, selectedPositionId]
    )

    return {
        selectedEdges,
        onEdgesChange,
        selectNode,
        selectPastedNodes,
        clearNodeSelection,
        clearSelectedEdges,
        selectEdge,
        recordNodeSelection,
        isNodeSelected,
    }
}
