import type { ChartDocument } from '../domain/chart.types'
import {
    migrateVersion2,
    migrateVersion3,
    migrateVersion4,
    legacyToChart,
} from './chart.migrations'
import { validateChartDocument } from './chart.validation'

export const CHART_STORAGE_KEY = 'paneltest3.chart'

export const LEGACY_POSITIONS_STORAGE_KEY = 'paneltest3.positions'

function persistMigration(
    originalChart: string | null,
    migrated: ChartDocument
): void {
    const validated = validateChartDocument(migrated)
    try {
        window.localStorage.setItem(
            CHART_STORAGE_KEY,
            JSON.stringify(validated)
        )
    } catch (error) {
        try {
            if (originalChart === null)
                window.localStorage.removeItem(CHART_STORAGE_KEY)
            else window.localStorage.setItem(CHART_STORAGE_KEY, originalChart)
        } catch {
            // Storage may be unavailable; retain the original value when possible.
        }
        throw error
    }
}

export function readLocalChart(): ChartDocument {
    const rawChart = window.localStorage.getItem(CHART_STORAGE_KEY)
    if (rawChart !== null) {
        const parsed: unknown = JSON.parse(rawChart)
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'version' in parsed &&
            (parsed.version === 2 ||
                parsed.version === 3 ||
                parsed.version === 4)
        ) {
            const migrated =
                parsed.version === 2
                    ? migrateVersion2(parsed)
                    : parsed.version === 3
                      ? migrateVersion3(parsed)
                      : migrateVersion4(parsed)
            persistMigration(rawChart, migrated)
            return migrated
        }
        const validated = validateChartDocument(parsed)
        return validated
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_POSITIONS_STORAGE_KEY)
    if (legacyRaw === null)
        return { version: 5, positions: [], lines: [], branchPoints: [] }

    const migrated = legacyToChart(JSON.parse(legacyRaw) as unknown)
    persistMigration(null, migrated)
    return migrated
}

export function writeLocalChart(document: ChartDocument): void {
    const validated = validateChartDocument(document)
    window.localStorage.setItem(CHART_STORAGE_KEY, JSON.stringify(validated))
}
