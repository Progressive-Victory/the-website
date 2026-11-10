import { PositionTypes, type Permission } from 'pv-contracts/data'

export { PositionTypes }

export interface Position {
    id: number
    name: string
    coordinates?: { x: number; y: number }
    type: PositionTypes
    seats: number | null
    userIds: number[]
    permissions: Permission[]
    parentGroupId?: number
    groupBounds?: GroupBounds
}

export interface GroupBounds {
    x: number
    y: number
    width: number
    height: number
}

export type HandleSide = 'top' | 'right' | 'bottom' | 'left'

export interface AnchorPoint {
    id: string
    kind: 'anchorpoint'
    positionId: number
    handle: HandleSide
}

export interface Waypoint {
    id: string
    kind: 'waypoint'
    coordinates: { x: number; y: number }
}

export interface BranchPoint {
    id: string
    coordinates: { x: number; y: number }
}

export interface BranchPointReference {
    id: string
    kind: 'branchpoint'
}

export type LinePointData = AnchorPoint | Waypoint | BranchPointReference

export type ResolvedBranchPoint = BranchPointReference &
    Pick<BranchPoint, 'coordinates'>

export type ResolvedLine = Omit<Line, 'points'> & {
    points: (AnchorPoint | Waypoint | ResolvedBranchPoint)[]
}

export interface Line {
    id: string
    points: LinePointData[]
}

export interface ChartDocument {
    version: number
    positions: Position[]
    lines: Line[]
    branchPoints: BranchPoint[]
}

export const ORG_CHART_VERSION = 1

export const EMPTY_CHART: ChartDocument = {
    version: ORG_CHART_VERSION,
    positions: [],
    lines: [],
    branchPoints: [],
}

export type { UserProfile } from 'pv-contracts/data'

export type { SearchRequest as MemberSearch } from 'pv-contracts/requests'
