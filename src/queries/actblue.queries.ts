import { useFetch } from '@/util/hooks'
import { zActBlueDonationPacket } from 'pv-contracts/data'
import { SearchRequest } from 'pv-contracts/requests'
import { zPaginatedResponse } from 'pv-contracts/responses'
import { zActBlueFundraisingStatsResponse } from 'pv-contracts/responses'

export function useActblueQueries() {
    const { ready, onGet } = useFetch()

    return {
        ready,
        getContributions: (options?: {
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
        getFundraisingStats: (options?: {
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
