'use client'

import styles from './page.module.css'
import {
    ActBlueFundraisingStatsResponse,
    zActBlueFundraisingStatsResponse,
} from '@/contracts/responses/fundraisingStatsResponse'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

function formatCurrency(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function formatCount(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US')
}

function startOfDayISO(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString()
}

function endOfDayISO(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()
}

function isoToDateInput(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function dateInputToStartISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 0, 0, 0).toISOString()
}

function dateInputToEndISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 23, 59, 59).toISOString()
}

function getPresetRange(preset: string): [string, string] {
    const today = new Date()

    switch (preset) {
        case 'All Time':
            return ['', '']
        case 'Year To Date':
            return [startOfDayISO(new Date(today.getFullYear(), 0, 1)), endOfDayISO(today)]
        case 'Month To Date':
            return [startOfDayISO(new Date(today.getFullYear(), today.getMonth(), 1)), endOfDayISO(today)]
        case 'Last Month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const end = new Date(today.getFullYear(), today.getMonth(), 0)
            return [startOfDayISO(start), endOfDayISO(end)]
        }
        case 'Week To Date': {
            const day = today.getDay()
            const diff = day === 0 ? 6 : day - 1
            const start = new Date(today)
            start.setDate(today.getDate() - diff)
            return [startOfDayISO(start), endOfDayISO(today)]
        }
        case 'Last 7 Days': {
            const start = new Date(today)
            start.setDate(today.getDate() - 6)
            return [startOfDayISO(start), endOfDayISO(today)]
        }
        case 'Today':
            return [startOfDayISO(today), endOfDayISO(today)]
        default:
            return ['', '']
    }
}

const PRESETS = ['All Time', 'Year To Date', 'Month To Date', 'Last Month', 'Week To Date', 'Last 7 Days', 'Today'] as const
type Preset = typeof PRESETS[number]

function findMatchingPreset(start: string, end: string): Preset | null {
    for (const preset of PRESETS) {
        const [ps, pe] = getPresetRange(preset)
        if (ps === start && pe === end) return preset
    }
    return null
}

export default function Page() {
    const [startDate, setStartDate] = useState(() => getPresetRange('Today')[0])
    const [endDate, setEndDate] = useState(() => getPresetRange('Today')[1])
    const [activePreset, setActivePreset] = useState<Preset | null>('Today')

    function applyPreset(preset: Preset) {
        const [start, end] = getPresetRange(preset)
        setStartDate(start)
        setEndDate(end)
        setActivePreset(preset)
    }

    const { onGet } = useFetch()

    const isAllTime = !startDate && !endDate

    const statsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats', startDate || null, endDate || null],
        queryFn: () =>
            onGet<ActBlueFundraisingStatsResponse>(
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
            ),
        placeholderData: keepPreviousData,
    })

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Fundraising</span>
                </div>

                <div className={styles.panelTimestamp}>Last Updated: </div>
            </div>

            <div className={styles.galleryHeader}>
                <h1 className={styles.galleryTitle}>Fundraising</h1>
                <p className={styles.gallerySubTitle}>
                    Manage ActBlue donors and contribution records.
                </p>
            </div>
            <div className={styles.dateRangeRow}>
                <div className={styles.dateRangeInputs}>
                <label className={styles.dateRangeInputLabel}>
                    Start Date
                    <input
                        type="date"
                        className={styles.dateRangeInput}
                        value={isoToDateInput(startDate)}
                        max={isoToDateInput(endDate) || undefined}
                        onChange={(e) => { const iso = dateInputToStartISO(e.target.value); setStartDate(iso); setActivePreset(findMatchingPreset(iso, endDate)) }}
                    />
                </label>
                <label className={styles.dateRangeInputLabel}>
                    End Date
                    <input
                        type="date"
                        className={styles.dateRangeInput}
                        value={isoToDateInput(endDate)}
                        min={isoToDateInput(startDate) || undefined}
                        onChange={(e) => { const iso = dateInputToEndISO(e.target.value); setEndDate(iso); setActivePreset(findMatchingPreset(startDate, iso)) }}
                    />
                </label>
                </div>

                <div className={styles.dateRangePresets}>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            className={`${styles.presetButton}${activePreset === preset ? ` ${styles.presetButtonActive}` : ''}`}
                            onClick={() => applyPreset(preset)}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.dateRangeSummary}>
                <span>
                    <strong>Start:</strong>{' '}
                    {startDate
                        ? <>{new Date(startDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })} <code className={styles.isoString}>{startDate}</code></>
                        : 'All Time'}
                </span>
                <span className={styles.dateRangeSummarySep}>→</span>
                <span>
                    <strong>End:</strong>{' '}
                    {endDate
                        ? <>{new Date(endDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })} <code className={styles.isoString}>{endDate}</code></>
                        : 'All Time'}
                </span>
            </div>

            <p>
                Total Dollars Raised:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : statsQuery.data?.totalDollarsRaised != null
                      ? formatCurrency(statsQuery.data.totalDollarsRaised)
                      : '—'}
            </p>

            <p>
                One-Time Dollars Raised:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCurrency(statsQuery.data?.oneTimeDollarsRaised)}
            </p>

            <p>
                Recurring Dollars Raised:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCurrency(statsQuery.data?.recurringDollarsRaised)}
            </p>

            <p>
                Total Contribution Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.totalContributionCount)}
            </p>

            <p>
                One-Time Contribution Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.oneTimeContributionCount)}
            </p>

            <p>
                Recurring Contribution Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.recurringContributionCount)}
            </p>

            <p>
                Total Donor Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.totalDonorCount)}
            </p>

            <p>
                One-Time Donor Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.oneTimeDonorCount)}
            </p>

            <p>
                Recurring Donor Count:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCount(statsQuery.data?.recurringDonorCount)}
            </p>

            <p>
                Average Contribution Amount:{' '}
                {statsQuery.isLoading
                    ? 'Loading…'
                    : formatCurrency(statsQuery.data?.avgContributionAmount)}
            </p>

        </div>
    )
}
