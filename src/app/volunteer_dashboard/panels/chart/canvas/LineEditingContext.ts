import type { Line, HandleSide, BranchPoint } from '../domain/chart.types'
import { createContext } from 'react'

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
