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

    const getVersion = (versionNumber: number, signal?: AbortSignal) =>
        onGet('/orgChart/:versionNumber', zOrgChartFileResponse, {
            params: { versionNumber },
            signal,
        }).catch((error: unknown) => {
            if (error instanceof FetchError && error.status === 404) return null
            throw error
        })

    // Every save creates a new version and the API has no "latest" route.
    const getLatestVersion = async (signal?: AbortSignal) => {
        let latest = await getVersion(1, signal)
        if (!latest) return null
        let missing = 2
        let next = await getVersion(missing, signal)
        while (next) {
            latest = next
            missing *= 2
            next = await getVersion(missing, signal)
        }
        let found = latest.versionNumber
        while (missing - found > 1) {
            const middle = Math.floor((found + missing) / 2)
            const file = await getVersion(middle, signal)
            if (file) {
                latest = file
                found = middle
            } else missing = middle
        }
        return latest
    }

    const getOrgChart = async (options?: {
        signal?: AbortSignal
    }): Promise<ChartDocument> => {
        const file = await getLatestVersion(options?.signal)
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
