'use client'

import { alignDraggedNodes, type AlignmentGuides } from './magneticAlignment'
import { snapNodeCenters } from './positions.placement'
import type { Node } from '@xyflow/react'
import { useCallback, useRef, useState } from 'react'

export function useChartAlignment() {
    const [guides, setGuides] = useState<AlignmentGuides>({})
    const alignedPositions = useRef(new Map<string, { x: number; y: number }>())

    const alignDuringDrag = useCallback(
        (nodes: Node[], draggingIds: ReadonlySet<string>) => {
            if (!draggingIds.size) return nodes
            const aligned = alignDraggedNodes(nodes, draggingIds)
            setGuides(aligned.guides)
            alignedPositions.current.clear()
            for (const node of aligned.nodes) {
                if (draggingIds.has(node.id))
                    alignedPositions.current.set(node.id, node.position)
            }
            return aligned.nodes
        },
        []
    )

    const finishNodeChanges = useCallback(
        (nodes: Node[], dragEnded: boolean) => {
            if (!dragEnded) return nodes
            setGuides({})
            return nodes.map((node) => {
                const position = alignedPositions.current.get(node.id)
                return position ? { ...node, position } : node
            })
        },
        []
    )

    const prepareDraggedNodes = useCallback(
        (nodes: Node[], draggedNodes: Node[]) => {
            const movedIds = new Set(draggedNodes.map(({ id }) => id))
            const snapped = alignedPositions.current.size
                ? nodes.map((node) => {
                      const position = alignedPositions.current.get(node.id)
                      return position ? { ...node, position } : node
                  })
                : snapNodeCenters(
                      nodes.map(
                          (node) =>
                              draggedNodes.find(({ id }) => id === node.id) ??
                              node
                      ),
                      movedIds
                  )
            alignedPositions.current.clear()
            setGuides({})
            return { nodes: snapped, movedIds }
        },
        []
    )

    const clear = useCallback(() => {
        alignedPositions.current.clear()
        setGuides({})
    }, [])

    return {
        guides,
        alignDuringDrag,
        finishNodeChanges,
        prepareDraggedNodes,
        clear,
    }
}
