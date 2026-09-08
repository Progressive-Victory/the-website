import { zEndorsement } from '@/contracts/data'
import {
    CreateEndorsementRequest,
    UpdateEndorsementRequest,
} from '@/contracts/requests'
import { zUploadImageResponse } from '@/contracts/responses'
import { ApiError, FetchError } from '@/models'
import { useAuth, useFetch } from '@/util/hooks'
import z from 'zod'

function normalizeEndorsementRequest<T extends Record<string, unknown>>(
    request: T
) {
    const { publishEndorsement, ...rest } = request as T & {
        publishEndorsement?: boolean
        endorsementPublished?: boolean
    }

    return {
        ...rest,
        endorsementPublished:
            request.endorsementPublished ?? publishEndorsement ?? false,
    }
}

export function useEndorsementQueries() {
    const { ready, onGet, onPost, onPatch, onDelete } = useFetch()
    const { apiBaseUrl } = useAuth()

    const uploadImage = async (image: File) => {
        if (!apiBaseUrl) throw new Error('API is not ready yet')

        const body = new FormData()
        body.append('image', image)

        const res = await fetch(new URL('/images', apiBaseUrl), {
            method: 'POST',
            credentials: 'include',
            body,
        })

        if (!res.ok) {
            const error = (await res.json()) as ApiError
            throw new FetchError(error.message, res.status, error.error)
        }

        return z.parse(zUploadImageResponse, await res.json())
    }

    return {
        ready,
        getEndorsements: (options?: { signal?: AbortSignal }) =>
            onGet('/endorsements', z.array(zEndorsement), {
                signal: options?.signal,
            }),
        createEndorsement: (request: CreateEndorsementRequest) =>
            onPost(
                '/endorsements',
                normalizeEndorsementRequest(request),
                zEndorsement
            ),
        updateEndorsement: (
            endorsementId: number,
            request: UpdateEndorsementRequest
        ) =>
            onPatch(
                '/endorsements/:endorsementId',
                normalizeEndorsementRequest(request),
                zEndorsement,
                {
                    params: { endorsementId },
                }
            ),
        deleteEndorsement: (endorsementId: number) =>
            onDelete('/endorsements/:endorsementId', {
                params: { endorsementId },
            }),
        uploadImage,
    }
}
