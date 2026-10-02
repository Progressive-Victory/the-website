import type { ChartFlowNode, SeatInfo } from './components'
import { getUserDisplayName } from '@/app/volunteer_dashboard/panels/positions/positions.utils'
import type { Edge } from '@xyflow/react'
import {
    PositionTypes,
    type Position,
    type UserProfile,
} from 'pv-contracts/data'

const SEAT_WIDTH = 248
const SEAT_HEIGHT = 118
const SEAT_GAP = 50
const POSITION_GAP = 50
const MAX_ROW_WIDTH = 1600
const ROSTER_SEAT_THRESHOLD = 4
const ROSTER_BASE_HEIGHT = 56
const ROSTER_ROW_HEIGHT = 60
const GROUP_PADDING = 10
const GROUP_MIN_HEIGHT = 140
const GROUP_HEADER_HEIGHT = 30

function buildSeat(
    userId: number | undefined,
    userById: Map<number, UserProfile>
): SeatInfo {
    const user = userId != null ? userById.get(userId) : undefined
    const discordUser = user?.discordUsers?.[0]

    return {
        name: user ? getUserDisplayName(user) : 'Unfilled',
        isUnfilled: !user,
        discordUsername: discordUser?.username,
        discordUserId: discordUser?.id,
        discordImageId: discordUser?.image,
    }
}

interface SeatNodeOptions {
    id: string
    position: { x: number; y: number }
    positionId: number
    title?: string
    seats: SeatInfo[]
}

function buildSeatNode({
    id,
    position,
    positionId,
    title,
    seats,
}: SeatNodeOptions): ChartFlowNode {
    if (seats.length >= ROSTER_SEAT_THRESHOLD)
        return {
            id,
            type: 'rosterNode',
            position,
            data: { positionId, title, seats },
        }

    if (seats.length > 1)
        return {
            id,
            type: 'multiSeatNode',
            position,
            data: { positionId, title, seats },
        }

    return {
        id,
        type: 'chartNode',
        position,
        data: { positionId, title, seat: seats[0] },
    }
}

export function buildPositionNodes(
    positions: Position[],
    users: UserProfile[]
): ChartFlowNode[] {
    const userById = new Map(users.map((user) => [user.id, user]))
    let rowX = 0
    let rowY = 0
    let rowHeight = 0

    return positions.flatMap((position): ChartFlowNode[] => {
        const declaredSeats = Math.max(position.seats, position.userIds.length)
        const isGroup = position.type === PositionTypes.GROUP
        const seatCount = isGroup ? declaredSeats : Math.max(declaredSeats, 1)
        const isRoster = seatCount >= ROSTER_SEAT_THRESHOLD

        const contentWidth =
            isRoster || seatCount <= 1
                ? SEAT_WIDTH
                : seatCount * SEAT_WIDTH + (seatCount - 1) * SEAT_GAP
        const contentHeight = isRoster
            ? ROSTER_BASE_HEIGHT + seatCount * ROSTER_ROW_HEIGHT
            : SEAT_HEIGHT

        const blockWidth = isGroup
            ? contentWidth + GROUP_PADDING * 2
            : contentWidth
        let blockHeight = contentHeight
        if (isGroup)
            blockHeight = Math.max(
                GROUP_MIN_HEIGHT,
                GROUP_HEADER_HEIGHT +
                    (seatCount > 0 ? contentHeight : 0) +
                    GROUP_PADDING
            )

        if (rowX > 0 && rowX + blockWidth > MAX_ROW_WIDTH) {
            rowX = 0
            rowY += rowHeight + POSITION_GAP
            rowHeight = 0
        }

        const nodePosition = { x: rowX, y: rowY }
        rowX += blockWidth + POSITION_GAP
        rowHeight = Math.max(rowHeight, blockHeight)

        const id = `position-${position.id}`
        const seats = Array.from({ length: seatCount }, (_, seatIndex) =>
            buildSeat(position.userIds[seatIndex], userById)
        )

        if (!isGroup)
            return [
                buildSeatNode({
                    id,
                    position: nodePosition,
                    positionId: position.id,
                    title: position.name,
                    seats,
                }),
            ]

        const groupNode: ChartFlowNode = {
            id,
            type: 'positionGroup',
            position: nodePosition,
            data: { title: position.name },
            width: blockWidth,
            height: blockHeight,
        }

        if (seats.length === 0) return [groupNode]

        return [
            groupNode,
            {
                ...buildSeatNode({
                    id: `${id}-seats`,
                    position: {
                        x: GROUP_PADDING,
                        y: GROUP_HEADER_HEIGHT,
                    },
                    positionId: position.id,
                    seats,
                }),
                parentId: id,
                extent: 'parent',
            },
        ]
    })
}

export const initialEdges: Edge[] = []
