'use client'

import type { Position, Line, BranchPoint } from '../domain/chart.types'
import {
    copyChartSelection,
    pastedSelectionIds,
    type ChartClipboard,
} from './chartClipboard'
import { linePointNodeType } from './linePointNodes'
import { parseErrorMessage } from '@/util'
import type { Node, ReactFlowInstance } from '@xyflow/react'
import { useState, type KeyboardEvent, type RefObject } from 'react'

interface ChartClipboardOptions {
    positions: Position[]
    lines: Line[]
    branchPoints: BranchPoint[]
    nodes: Node[]
    coordinateOffsets: Map<string, { x: number; y: number }>
    groupBounds: Map<number, NonNullable<Position['groupBounds']>>
    isEditing: boolean
    disabled: boolean
    flowReady: boolean
    flowRef: RefObject<Pick<
        ReactFlowInstance,
        'screenToFlowPosition' | 'getNodes' | 'getInternalNode'
    > | null>
    containerRef: RefObject<HTMLDivElement | null>
    mousePosition: RefObject<{ x: number; y: number } | null>
    selectPastedNodes: (ids: Iterable<string>) => void
    clearNodeSelection: () => void
    clearSelectedEdges: () => void
    onPasteSelection?: (
        clipboard: ChartClipboard,
        at: { x: number; y: number }
    ) => ChartClipboard
    onCutSelection?: (ids: number[]) => void
    onSelectLine?: (id: string | null) => void
}

export function useChartClipboard({
    positions,
    lines,
    branchPoints,
    nodes,
    coordinateOffsets,
    groupBounds,
    isEditing,
    disabled,
    flowReady,
    flowRef,
    containerRef,
    mousePosition,
    selectPastedNodes,
    clearNodeSelection,
    clearSelectedEdges,
    onPasteSelection,
    onCutSelection,
    onSelectLine,
}: ChartClipboardOptions) {
    const [clipboard, setClipboard] = useState<ChartClipboard | null>(null)
    const canCopy = nodes.some(
        (node) => node.selected && node.type !== linePointNodeType
    )
    const canEdit = isEditing && !disabled

    const copySelection = () => {
        const snapshot = positions.map((position) => {
            const node = nodes.find(({ id }) => id === String(position.id))
            if (!node) throw new Error('The selected node is not available.')
            const offset = coordinateOffsets.get(node.id)
            return {
                ...position,
                coordinates: {
                    x: node.position.x - (offset?.x ?? 0),
                    y: node.position.y - (offset?.y ?? 0),
                },
                groupBounds:
                    groupBounds.get(position.id) ?? position.groupBounds,
            }
        })
        const copied = copyChartSelection(
            { positions: snapshot, lines, branchPoints },
            new Set(
                nodes
                    .filter(
                        (node) =>
                            node.selected && node.type !== linePointNodeType
                    )
                    .map(({ id }) => Number(id))
            )
        )
        setClipboard(copied)
        return copied
    }

    const clipboardAction = (action: 'copy' | 'cut' | 'paste') => {
        try {
            if (action === 'paste') {
                if (!canEdit || !clipboard || !onPasteSelection) return
                const flow = flowRef.current
                const bounds = containerRef.current?.getBoundingClientRect()
                if (!flow || !bounds)
                    throw new Error('The chart is not ready to paste.')
                const at = flow.screenToFlowPosition(
                    mousePosition.current ?? {
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2,
                    },
                    { snapToGrid: false }
                )
                const pasted = onPasteSelection(clipboard, {
                    x: Math.round(at.x / 5) * 5,
                    y: Math.round(at.y / 5) * 5,
                })
                selectPastedNodes(pastedSelectionIds(pasted))
                clearSelectedEdges()
                onSelectLine?.(null)
                return
            }
            if (!canCopy || (action === 'cut' && (!canEdit || !onCutSelection)))
                return
            const copied = copySelection()
            if (action === 'cut') {
                onCutSelection?.(copied.positions.map(({ id }) => id))
                clearNodeSelection()
            }
        } catch (error) {
            console.error(`Chart ${action} failed`, error)
            alert(`Chart ${action} failed. ${parseErrorMessage(error)}`)
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (
            event.defaultPrevented ||
            event.repeat ||
            event.altKey ||
            (!event.metaKey && !event.ctrlKey) ||
            (event.target instanceof Element &&
                event.target.closest(
                    'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
                )) ||
            window.getSelection()?.toString()
        )
            return
        const key = event.key.toLowerCase()
        const action =
            key === 'c'
                ? 'copy'
                : key === 'x'
                  ? 'cut'
                  : key === 'v'
                    ? 'paste'
                    : undefined
        if (
            !action ||
            (action === 'copy' && !canCopy) ||
            (action === 'cut' && (!canEdit || !canCopy || !onCutSelection)) ||
            (action === 'paste' &&
                (!canEdit || !clipboard || !onPasteSelection))
        )
            return
        event.preventDefault()
        event.stopPropagation()
        clipboardAction(action)
    }

    return {
        clipboard,
        canCopy,
        canEdit,
        canPaste: Boolean(flowReady && clipboard && onPasteSelection),
        clipboardAction,
        onKeyDown,
    }
}
