import PositionData from './positionData'

export default interface TeamData {
    id: number
    name: string
    desc?: string
    leads?: PositionData[]
    members?: PositionData[]
}
