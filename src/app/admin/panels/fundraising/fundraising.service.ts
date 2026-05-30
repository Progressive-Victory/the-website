import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { PaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import {
    ActBlueFundraisingStatsResponse,
    zActBlueFundraisingStatsResponse,
} from '@/contracts/responses/fundraisingStatsResponse'
import type { QueryParams, ZodSchema } from '@/util/hooks/useFetch'

interface GetOptions {
    query?: QueryParams
    signal?: AbortSignal
}

type OnGet = <R>(
    url: string,
    schema: ZodSchema,
    options?: GetOptions
) => Promise<R>

export async function getFundraisingStats(
    onGet: OnGet,
    startDate?: string,
    endDate?: string
) {
    const isAllTime = !startDate && !endDate

    return onGet<ActBlueFundraisingStatsResponse>(
        '/actblue/fundraising/stats',
        zActBlueFundraisingStatsResponse,
        isAllTime
            ? undefined
            : {
                  query: {
                      ...(startDate && { startDate }),
                      ...(endDate && { endDate }),
                  },
              }
    )
}

export async function getEarliestContribution(onGet: OnGet) {
    return onGet<PaginatedResponse<ActBlueDonationPacket>>(
        '/actblue/contributions',
        zPaginatedResponse(zActBlueDonationPacket),
        {
            query: {
                page: 0,
                limit: 1,
                sortField: 'paidAt',
                sort: SortDirection.ASC,
            },
        }
    )
}
