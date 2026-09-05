'use client'

import styles from './Table.module.css'
import { cn } from '@/util'
import React, { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const DEFAULT_COLUMN_WIDTH = '10rem'

export interface Column<T> {
    key: string
    header: string
    render: (row: T, index: number) => React.ReactNode
    width?: string
    allowOverflow?: boolean
    onCellClick?: (row: T, index: number) => void
    menu?: (row: T, controls: { closeDropdown: () => void }) => React.ReactNode
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
    footer?: React.ReactNode
}

type SortDir = 'asc' | 'desc'

function TableCell<T>({
    col,
    row,
    index,
    isOpen,
    onToggle,
    onClose,
}: {
    col: Column<T>
    row: T
    index: number
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
}) {
    const interactive = Boolean(col.menu ?? col.onCellClick)

    const activate = () => {
        col.onCellClick?.(row, index)
        if (col.menu) onToggle()
    }

    return (
        <span
            className={cn(
                col.allowOverflow ? styles.cellOverflowVisible : styles.cell,
                interactive && styles.clickable
            )}
            data-label={col.header}
            data-open-cell={isOpen ? 'true' : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-expanded={col.menu ? isOpen : undefined}
            onClick={interactive ? activate : undefined}
            onKeyDown={
                interactive
                    ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              activate()
                          }
                      }
                    : undefined
            }
        >
            {col.allowOverflow ? (
                col.render(row, index)
            ) : (
                <span className={styles.cellContent}>
                    {col.render(row, index)}
                </span>
            )}
            {isOpen && col.menu && (
                <span
                    className={styles.menuAnchor}
                    data-open-cell="true"
                    onClick={(event) => event.stopPropagation()}
                >
                    {col.menu(row, { closeDropdown: onClose })}
                </span>
            )}
        </span>
    )
}

export function Table<T>({
    columns,
    data,
    rowKey,
    collapsedCategories = [],
    footer,
}: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [openCell, setOpenCell] = useState<string | null>(null)

    useEffect(() => {
        if (!openCell) return

        const onDocumentMouseDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null
            if (target?.closest('[data-open-cell="true"]')) return
            setOpenCell(null)
        }

        const onDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenCell(null)
        }

        document.addEventListener('mousedown', onDocumentMouseDown)
        document.addEventListener('keydown', onDocumentKeyDown)

        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
            document.removeEventListener('keydown', onDocumentKeyDown)
        }
    }, [openCell])

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
            if (typeof aVal === 'string' && typeof bVal === 'string')
                return aVal.localeCompare(bVal, undefined, {
                    sensitivity: 'base',
                })
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
                                            <span
                                                className={styles.cellContent}
                                            >
                                                {rowOverrides.get(
                                                    entry.category.label
                                                )}
                                            </span>
                                        </span>
                                    )
                                }
                                const col = entry.col!
                                const cellId = `${rowKey(row, index)}::${col.key}`
                                return (
                                    <TableCell
                                        key={col.key}
                                        col={col}
                                        row={row}
                                        index={index}
                                        isOpen={openCell === cellId}
                                        onToggle={() =>
                                            setOpenCell((current) =>
                                                current === cellId
                                                    ? null
                                                    : cellId
                                            )
                                        }
                                        onClose={() => setOpenCell(null)}
                                    />
                                )
                            })
                        })()}
                    </div>
                )
            })}
            {footer}
        </div>
    )
}
