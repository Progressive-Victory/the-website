import { zPosition } from '@/contracts/data'
import {
    CreatePositionRequest,
    UpdatePositionRequest,
} from '@/contracts/requests'
import { zPositionHierarchyResponse } from '@/contracts/responses'
import { useFetch } from '@/util/hooks'

export function usePositionQueries() {
    const { ready, onGet, onPost, onPatch, onDelete } = useFetch()

    return {
        ready,
        getPositionHierarchy: (options?: { signal?: AbortSignal }) =>
            onGet('/positions/hierarchy', zPositionHierarchyResponse, {
                signal: options?.signal,
            }),
        createPosition: (request: CreatePositionRequest) =>
            onPost('/positions', request, zPosition),
        updatePosition: (positionId: number, request: UpdatePositionRequest) =>
            onPatch('/positions/:positionId', request, zPosition, {
                params: { positionId },
            }),
        deletePosition: (positionId: number) =>
            onDelete('/positions/:positionId', { params: { positionId } }),
    }
}
