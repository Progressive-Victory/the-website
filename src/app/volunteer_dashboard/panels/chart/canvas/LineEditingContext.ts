import type { Line, HandleSide, BranchPoint } from '../api/domain/chart.types'
import type { FlowAnchor } from './tooltip/ChartTooltip'
import { createContext, type ReactNode } from 'react'

export type LinePointCoordinates = Record<string, { x: number; y: number }>

export const LineEditingContext = createContext<{
    editing: boolean
    showHitboxes?: boolean
    directionChevrons?: DirectionChevronMode
    onSelectPoint?: (lineId: string, pointId: string) => void
    onRemovePoint?: (
        lineId: string,
        pointId: string,
        targetPointId: string
    ) => void
    lines?: Line[]
    pointCoordinates?: LinePointCoordinates
    branchPoints?: BranchPoint[]
    onChangeBranchPoint?: (point: BranchPoint) => void
    onChange?: (line: Line) => void
    onPointCoordinates?: (coordinates: LinePointCoordinates) => void
    groupAt?: (coordinates: { x: number; y: number }) => number | undefined
    selectedPointIds?: ReadonlySet<string>
    renderLineTooltip?: (lineId: string, at: FlowAnchor) => ReactNode
    tooltipPointId?: string
    renderPointTooltip?: (
        lineId: string,
        pointId: string,
        at: FlowAnchor
    ) => ReactNode
    placingPointLineId?: string | null
    onPointPlaced?: () => void
    drawingBranchPointId?: string | null
    onBranchDrawn?: (completed: boolean) => void
    onBranch?: (
        lineId: string,
        pointId: string,
        targetId: number,
        handle: HandleSide
    ) => void
    onMergeBranch?: (
        lineId: string,
        pointId: string,
        targetPointId: string
    ) => void
}>({ editing: false })

export type DirectionChevronMode = 'all' | 'merges' | 'none'
