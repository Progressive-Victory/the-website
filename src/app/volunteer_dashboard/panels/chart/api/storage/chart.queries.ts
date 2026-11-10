import {
    EMPTY_CHART,
    ORG_CHART_VERSION,
    type ChartDocument,
} from '../domain/chart.types'
import { validateChartDocument } from './chart.validation'
import { FetchError } from '@/models'
import { useAuth, useFetch } from '@/util/hooks'
import { z } from 'zod'

export const ORG_CHART_QUERY_KEY = ['orgChart', ORG_CHART_VERSION]

const zOrgChartFileResponse = z.object({
    versionNumber: z.number().int().positive(),
    fileHref: z.string(),
})

const zOrgChartUploadResponse = z.object({ url: z.string() })

export function useOrgChartQueries() {
    const { ready, onGet, onPut } = useFetch()
    const { apiBaseUrl } = useAuth()

    const getOrgChart = async (options?: {
        signal?: AbortSignal
    }): Promise<ChartDocument> => {
        const file = await onGet(
            '/orgChart/:versionNumber',
            zOrgChartFileResponse,
            {
                params: { versionNumber: ORG_CHART_VERSION },
                signal: options?.signal,
            }
        ).catch((error: unknown) => {
            if (error instanceof FetchError && error.status === 404) return null
            throw error
        })
        if (!file) return EMPTY_CHART

        const res = await fetch(new URL(file.fileHref, apiBaseUrl), {
            cache: 'no-store',
            signal: options?.signal,
        })
        if (!res.ok)
            throw new FetchError(
                `Org chart file could not be downloaded (${res.status})`,
                res.status
            )
        return validateChartDocument(await res.json())
    }

    return {
        ready,
        getOrgChart,
        saveOrgChart: (document: ChartDocument) =>
            onPut('/orgChart', document, zOrgChartUploadResponse),
    }
}
