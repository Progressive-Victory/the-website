import Committee from './committee'

export default interface PositionData {
    id: number
    title?: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}
