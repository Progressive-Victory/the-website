import PositionData from './positionData'

export default interface DepartmentData {
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}
