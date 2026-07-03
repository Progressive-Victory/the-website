import { zActBlueDonationPacket } from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { zPaginatedResponse } from '@/contracts/responses'
import { zActBlueFundraisingStatsResponse } from '@/contracts/responses/fundraisingStatsResponse'
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

    return onGet(
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
    return onGet(
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

export async function getFundraisingBucketStats(
    onGet: OnGet,
    bucketStartIso: string,
    bucketEndIso: string
) {
    return onGet(
        '/actblue/fundraising/stats',
        zActBlueFundraisingStatsResponse,
        {
            query: {
                startDate: bucketStartIso,
                endDate: bucketEndIso,
            },
        }
    )
}
