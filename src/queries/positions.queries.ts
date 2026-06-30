import { Position, zPosition } from '@/contracts/data'
import {
    CreatePositionRequest,
    UpdatePositionRequest,
} from '@/contracts/requests'
import {
    PositionHierarchyResponse,
    zPositionHierarchyResponse,
} from '@/contracts/responses'
import { useFetch } from '@/util/hooks'

export function usePositionQueries() {
    const { ready, onGet, onPost, onPatch, onDelete } = useFetch()

    return {
        ready,
        getPositionHierarchy: () =>
            onGet<PositionHierarchyResponse>(
                '/positions/hierarchy',
                zPositionHierarchyResponse
            ),
        createPosition: (request: CreatePositionRequest) =>
            onPost<Position>('/positions', request, zPosition),
        updatePosition: (positionId: number, request: UpdatePositionRequest) =>
            onPatch<Position>(`/positions/${positionId}`, request, zPosition),
        deletePosition: (positionId: number) =>
            onDelete(`/positions/${positionId}`),
    }
}
