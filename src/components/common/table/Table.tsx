'use client'

import styles from './Table.module.css'
import React, { useMemo, useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const DEFAULT_COLUMN_WIDTH = '10rem'

export interface Column<T> {
    key: string
    header: string
    render: (row: T) => React.ReactNode
    width?: string
    sortValue?: (row: T) => string | number | boolean | null | undefined
}

export interface ColumnCategory<T> {
    label: string
    columns: Column<T>[]
    collapsedWidth?: string
    dotColor?: (row: T, col: Column<T>) => string | null
    rowRender?: (row: T) => React.ReactNode | null
}

export type ColumnEntry<T> = Column<T> | ColumnCategory<T>

function isCategory<T>(entry: ColumnEntry<T>): entry is ColumnCategory<T> {
    return 'columns' in entry && 'label' in entry
}

export interface TableProps<T> {
    columns: ColumnEntry<T>[]
    data: T[]
    rowKey: (row: T, index: number) => string | number
    collapsedCategories?: string[]
}

type SortDir = 'asc' | 'desc'

export function Table<T>({
    columns,
    data,
    rowKey,
    collapsedCategories = [],
}: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const collapsedSet = useMemo(
        () => new Set(collapsedCategories),
        [collapsedCategories]
    )

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const flatColumns = useMemo(
        () =>
            columns.flatMap((entry) =>
                isCategory(entry) ? entry.columns : [entry]
            ),
        [columns]
    )

    const sortedData = useMemo(() => {
        const col = flatColumns.find((c) => c.key === sortKey)
        if (!col?.sortValue) return data

        const sorted = [...data].sort((a, b) => {
            const aVal = col.sortValue!(a)
            const bVal = col.sortValue!(b)
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1
            if (aVal < bVal) return -1
            if (aVal > bVal) return 1
            return 0
        })

        return sortDir === 'desc' ? sorted.reverse() : sorted
    }, [data, flatColumns, sortKey, sortDir])

    const visibleEntries = useMemo(() => {
        const entries: {
            type: 'column' | 'group-collapsed'
            col?: Column<T>
            category?: ColumnCategory<T>
            width: string
        }[] = []
        for (const entry of columns) {
            if (isCategory(entry)) {
                if (collapsedSet.has(entry.label)) {
                    entries.push({
                        type: 'group-collapsed',
                        category: entry,
                        width: entry.collapsedWidth ?? '5rem',
                    })
                } else {
                    for (const col of entry.columns) {
                        entries.push({
                            type: 'column',
                            col,
                            category: entry,
                            width: col.width ?? DEFAULT_COLUMN_WIDTH,
                        })
                    }
                }
            } else {
                entries.push({
                    type: 'column',
                    col: entry,
                    width: entry.width ?? DEFAULT_COLUMN_WIDTH,
                })
            }
        }
        return entries
    }, [columns, collapsedSet])

    const gridTemplateColumns = visibleEntries.map((e) => e.width).join(' ')

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ gridTemplateColumns }}>
                {visibleEntries.map((entry) => {
                    if (entry.type === 'group-collapsed') {
                        return (
                            <span
                                key={`group-${entry.category!.label}`}
                                className={styles.collapsedHeader}
                            />
                        )
                    }
                    const col = entry.col!
                    return (
                        <span
                            key={col.key}
                            className={
                                col.sortValue
                                    ? styles.sortableHeader
                                    : undefined
                            }
                            onClick={
                                col.sortValue
                                    ? () => handleSort(col.key)
                                    : undefined
                            }
                        >
                            {col.header}
                            {col.sortValue && (
                                <span className={styles.sortIcon}>
                                    {sortKey === col.key ? (
                                        sortDir === 'asc' ? (
                                            <FiChevronUp strokeWidth={3} />
                                        ) : (
                                            <FiChevronDown strokeWidth={3} />
                                        )
                                    ) : (
                                        <FiChevronDown strokeWidth={2} />
                                    )}
                                </span>
                            )}
                        </span>
                    )
                })}
            </div>

            {sortedData.map((row, index) => {
                // Pre-compute rowRender results for categories
                const rowOverrides = new Map<string, React.ReactNode>()
                for (const entry of columns) {
                    if (isCategory(entry) && entry.rowRender) {
                        const result = entry.rowRender(row)
                        if (result != null) {
                            rowOverrides.set(entry.label, result)
                        }
                    }
                }

                return (
                    <div
                        key={rowKey(row, index)}
                        className={styles.row}
                        style={{ gridTemplateColumns }}
                    >
                        {(() => {
                            const rendered = new Set<string>()
                            return visibleEntries.map((entry) => {
                                if (entry.type === 'group-collapsed') {
                                    const category = entry.category!
                                    return (
                                        <span
                                            key={`group-${category.label}`}
                                            className={styles.dotCell}
                                        >
                                            {category.columns.map((col) => {
                                                const color =
                                                    category.dotColor?.(
                                                        row,
                                                        col
                                                    ) ?? null
                                                if (color) {
                                                    return (
                                                        <span
                                                            key={col.key}
                                                            className={
                                                                styles.dot
                                                            }
                                                            style={{
                                                                backgroundColor:
                                                                    color,
                                                            }}
                                                        />
                                                    )
                                                }
                                                return (
                                                    <span
                                                        key={col.key}
                                                        className={
                                                            styles.bullet
                                                        }
                                                    >
                                                        ·
                                                    </span>
                                                )
                                            })}
                                        </span>
                                    )
                                }
                                // Check if this column belongs to a category with a rowRender override
                                if (
                                    entry.category &&
                                    rowOverrides.has(entry.category.label)
                                ) {
                                    if (rendered.has(entry.category.label)) {
                                        return null
                                    }
                                    rendered.add(entry.category.label)
                                    const span = entry.category.columns.length
                                    return (
                                        <span
                                            key={`override-${entry.category.label}`}
                                            className={styles.cell}
                                            style={{
                                                gridColumn: `span ${span}`,
                                            }}
                                        >
                                            {rowOverrides.get(
                                                entry.category.label
                                            )}
                                        </span>
                                    )
                                }
                                const col = entry.col!
                                return (
                                    <span
                                        key={col.key}
                                        className={styles.cell}
                                        data-label={col.header}
                                    >
                                        {col.render(row)}
                                    </span>
                                )
                            })
                        })()}
                    </div>
                )
            })}
        </div>
    )
}
