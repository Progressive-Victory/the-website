import { zActBlueDonationPacket } from '@/contracts/data'
import { SearchRequest } from '@/contracts/requests'
import { zPaginatedResponse } from '@/contracts/responses'
import { zActBlueFundraisingStatsResponse } from '@/contracts/responses/fundraisingStatsResponse'
import { useFetch } from '@/util/hooks'

export function useActblueQueries() {
    const { ready, onGet } = useFetch()

    return {
        ready,
        getContributions: async (options?: {
            search?: SearchRequest
            signal?: AbortSignal
        }) => {
            const { search, signal } = options ?? {}
            return onGet(
                '/actblue/contributions',
                zPaginatedResponse(zActBlueDonationPacket),
                { query: search, signal }
            )
        },
        getFundraisingStats: async (options?: {
            startDate?: string
            endDate?: string
            signal?: AbortSignal
        }) => {
            const { startDate, endDate, signal } = options ?? {}
            return onGet(
                '/actblue/fundraising/stats',
                zActBlueFundraisingStatsResponse,
                { query: { startDate, endDate }, signal }
            )
        },
    }
}
