'use client'

import styles from './Table.module.css'
import { cn } from '@/util'
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { MdDragIndicator } from 'react-icons/md'

/*
 * How To Use:
 *
 * This component is our standardized data table. You describe your data with a
 * list of column definitions and hand it an array of rows; the table handles
 * layout, sticky headers, sorting, per-cell dropdown menus, an inline edit
 * mode, and row virtualization for large datasets.
 *
 * The table is generic over your row type <T>, so every callback you provide
 * receives a fully typed row.
 *
 *
 *
 * TableProps<T>:
 * - columns: Column definitions, optionally grouped into categories.
 * - data: The rows to render.
 * - rowKey: Returns a stable unique key for each row.
 * - collapsedCategories: Labels of categories to render collapsed as dots.
 * - mode: 'view' (default) or 'edit' to swap in the editable cell renderers.
 * - zebra: Alternating row background colors.
 * - footer: Rendered below the last row, inside the scroll container.
 *
 *
 * Column<T>:
 * - key: Unique column identifier, also used as the sort key.
 * - header: Header label text.
 * - render: Cell content in view mode.
 * - renderEdit: Cell content in edit mode. Omit to lock the column while editing.
 * - width: CSS grid track width. Defaults to 10rem.
 * - allowOverflow: Let content escape the cell instead of being ellipsized.
 * - onCellClick: Called when the cell is activated by click or Enter/Space.
 * - menu: Dropdown content anchored under the cell, opened on activation.
 * - sortValue: Provide to make the column sortable by clicking its header.
 * - reorderable: Set false to pin the column in place while reordering.
 *
 *
 * ColumnCategory<T>:
 * - label: Category name, used to target it via collapsedCategories.
 * - columns: The columns belonging to this category.
 * - collapsedWidth: Width used while collapsed. Defaults to 5rem.
 * - dotColor: Dot color per column while collapsed. Return null for a bullet.
 * - rowRender: Replaces the category's cells for a row with a single spanning cell.
 *
 *
 *
 * Example usage:
 *
 * import { Table, type ColumnEntry } from '@/components/common/table'
 *
 *
 * const columns: ColumnEntry<ExampleData>[] = [
 *     {
 *         key: 'name',
 *         header: 'Name',
 *         width: '14rem',
 *         render: (example) => example.name,
 *         renderEdit: (example) => <NameInput example={example} />,
 *         sortValue: (example) => example.name,
 *     },
 *     {
 *         label: 'Contact',
 *         columns: [
 *             { key: 'email', header: 'Email', render: (e) => e.email },
 *             { key: 'phone', header: 'Phone', render: (e) => e.phone },
 *         ],
 *     },
 * ]
 *
 *
 * <Table
 *     columns={columns}
 *     data={examples}
 *     rowKey={(example) => example.id}
 *     mode="view"
 *     zebra
 * />
 *
 */

const DEFAULT_COLUMN_WIDTH = '10rem'
const VIRTUALIZE_THRESHOLD = 60
const OVERSCAN = 10

export interface Column<T> {
    key: string
    header: string
    render: (row: T, index: number) => React.ReactNode
    renderEdit?: (row: T, index: number) => React.ReactNode
    width?: string
    allowOverflow?: boolean
    cellClassName?: (row: T, index: number) => string | undefined
    onCellClick?: (row: T, index: number) => void
    menu?: (row: T, controls: { closeDropdown: () => void }) => React.ReactNode
    sortValue?: (row: T) => string | number | boolean | null | undefined
    reorderable?: boolean
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

const entryId = <T,>(entry: ColumnEntry<T>) =>
    isCategory(entry) ? entry.label : entry.key

export type TableMode = 'view' | 'edit'

export interface TableProps<T> {
    columns: ColumnEntry<T>[]
    data: T[]
    rowKey: (row: T, index: number) => string | number
    collapsedCategories?: string[]
    mode?: TableMode
    zebra?: boolean
    footer?: React.ReactNode
    isScrollTarget?: (row: T) => boolean
    /** Column brought into horizontal view alongside the scroll target. */
    scrollToColumnKey?: string
    /** Increment to scroll the first isScrollTarget row into view. */
    scrollToRowToken?: number
    /** Allow header cells to be dragged to reorder top-level entries. */
    reorderable?: boolean
    /** Entry ids (column key, or category label) in the desired order. */
    entryOrder?: string[]
    onEntryOrderChange?: (order: string[]) => void
}

type SortDir = 'asc' | 'desc'

type OpenCellSetter = React.Dispatch<React.SetStateAction<string | null>>

interface VisibleEntry<T> {
    type: 'column' | 'group-collapsed'
    col?: Column<T>
    category?: ColumnCategory<T>
    width: string
}

function TableCellInner<T>({
    col,
    row,
    index,
    mode,
    isOpen,
    cellId,
    setOpenCell,
    dragging = false,
    entryId: cellEntryId,
}: {
    col: Column<T>
    row: T
    index: number
    mode: TableMode
    isOpen: boolean
    cellId: string
    setOpenCell: OpenCellSetter
    dragging?: boolean
    entryId?: string
}) {
    const editing = mode === 'edit'
    const editable = editing && col.renderEdit != null
    const interactive = !editing && Boolean(col.menu ?? col.onCellClick)

    const onClose = useCallback(() => setOpenCell(null), [setOpenCell])

    const activate = () => {
        col.onCellClick?.(row, index)
        if (col.menu)
            setOpenCell((current) => (current === cellId ? null : cellId))
    }

    const content = editable
        ? col.renderEdit!(row, index)
        : col.render(row, index)

    return (
        <span
            className={cn(
                col.allowOverflow ? styles.cellOverflowVisible : styles.cell,
                interactive && styles.clickable,
                editing && !editable && styles.lockedCell,
                dragging && styles.draggingCell,
                col.cellClassName?.(row, index)
            )}
            data-label={col.header}
            data-entry-id={cellEntryId}
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
                content
            ) : (
                <span className={styles.cellContent}>{content}</span>
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

const TableCell = React.memo(TableCellInner) as typeof TableCellInner

function TableRowInner<T>({
    row,
    index,
    rowId,
    columns,
    visibleEntries,
    gridTemplateColumns,
    mode,
    zebra,
    openColKey,
    setOpenCell,
    draggingEntryId,
}: {
    row: T
    index: number
    rowId: string | number
    columns: ColumnEntry<T>[]
    visibleEntries: VisibleEntry<T>[]
    gridTemplateColumns: string
    mode: TableMode
    zebra: boolean
    openColKey: string | null
    setOpenCell: OpenCellSetter
    draggingEntryId: string | null
}) {
    const rowOverrides = new Map<string, React.ReactNode>()
    for (const entry of columns) {
        if (isCategory(entry) && entry.rowRender) {
            const result = entry.rowRender(row)
            if (result != null) {
                rowOverrides.set(entry.label, result)
            }
        }
    }

    const rendered = new Set<string>()

    return (
        <div
            className={cn(
                styles.row,
                zebra && index % 2 === 1 && styles.rowAlt
            )}
            style={{ gridTemplateColumns }}
            data-table-row="true"
        >
            {visibleEntries.map((entry) => {
                if (entry.type === 'group-collapsed') {
                    const category = entry.category!
                    return (
                        <span
                            key={`group-${category.label}`}
                            data-entry-id={category.label}
                            className={cn(
                                styles.dotCell,
                                draggingEntryId === category.label &&
                                    styles.draggingCell
                            )}
                        >
                            {category.columns.map((col) => {
                                const color =
                                    category.dotColor?.(row, col) ?? null
                                if (color) {
                                    return (
                                        <span
                                            key={col.key}
                                            className={styles.dot}
                                            style={{ backgroundColor: color }}
                                        />
                                    )
                                }
                                return (
                                    <span
                                        key={col.key}
                                        className={styles.bullet}
                                    >
                                        ·
                                    </span>
                                )
                            })}
                        </span>
                    )
                }
                if (entry.category && rowOverrides.has(entry.category.label)) {
                    if (rendered.has(entry.category.label)) {
                        return null
                    }
                    rendered.add(entry.category.label)
                    const span = entry.category.columns.length
                    return (
                        <span
                            key={`override-${entry.category.label}`}
                            data-entry-id={entry.category.label}
                            className={cn(
                                styles.cell,
                                draggingEntryId === entry.category.label &&
                                    styles.draggingCell
                            )}
                            style={{ gridColumn: `span ${span}` }}
                        >
                            <span
                                className={cn(
                                    styles.cellContent,
                                    styles.overrideContent
                                )}
                            >
                                {rowOverrides.get(entry.category.label)}
                            </span>
                        </span>
                    )
                }
                const col = entry.col!
                return (
                    <TableCell
                        key={col.key}
                        col={col}
                        row={row}
                        index={index}
                        mode={mode}
                        isOpen={openColKey === col.key}
                        cellId={`${rowId}::${col.key}`}
                        setOpenCell={setOpenCell}
                        entryId={entry.category?.label ?? col.key}
                        dragging={
                            draggingEntryId ===
                            (entry.category?.label ?? col.key)
                        }
                    />
                )
            })}
        </div>
    )
}

const TableRow = React.memo(TableRowInner) as typeof TableRowInner

interface RowMetrics {
    rowHeight: number
    headerHeight: number
}

function useVirtualRange(
    containerRef: React.RefObject<HTMLDivElement | null>,
    { rowHeight, headerHeight }: RowMetrics,
    rowCount: number,
    enabled: boolean
) {
    const [range, setRange] = useState({ start: 0, end: rowCount })

    useEffect(() => {
        const container = containerRef.current

        if (!enabled || !container) {
            setRange({ start: 0, end: rowCount })
            return
        }

        let frame = 0

        const update = () => {
            frame = 0
            const offset = Math.max(0, container.scrollTop - headerHeight)
            const start = Math.max(0, Math.floor(offset / rowHeight) - OVERSCAN)
            const visible = Math.ceil(container.clientHeight / rowHeight)
            const end = Math.min(rowCount, start + visible + OVERSCAN * 2)

            setRange((current) =>
                current.start === start && current.end === end
                    ? current
                    : { start, end }
            )
        }

        const schedule = () => {
            if (frame === 0) frame = requestAnimationFrame(update)
        }

        update()
        container.addEventListener('scroll', schedule, { passive: true })
        const observer = new ResizeObserver(schedule)
        observer.observe(container)

        return () => {
            container.removeEventListener('scroll', schedule)
            observer.disconnect()
            if (frame !== 0) cancelAnimationFrame(frame)
        }
    }, [containerRef, rowHeight, headerHeight, rowCount, enabled])

    return range
}

export function Table<T>({
    columns,
    data,
    rowKey,
    collapsedCategories = [],
    mode = 'view',
    zebra = false,
    footer,
    isScrollTarget,
    scrollToColumnKey,
    scrollToRowToken,
    reorderable = false,
    entryOrder,
    onEntryOrderChange,
}: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [openCell, setOpenCell] = useState<string | null>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dropTarget, setDropTarget] = useState<{
        id: string
        after: boolean
    } | null>(null)
    const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null)
    const [handleOffsets, setHandleOffsets] = useState<Record<string, number>>(
        {}
    )
    const [metrics, setMetrics] = useState<RowMetrics>({
        rowHeight: 0,
        headerHeight: 0,
    })
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const handledScrollToken = useRef<number | undefined>(undefined)

    useEffect(() => {
        if (mode === 'edit') setOpenCell(null)
    }, [mode])

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

    const orderedColumns = useMemo(() => {
        if (!entryOrder?.length) return columns
        const rank = new Map(entryOrder.map((id, index) => [id, index]))
        return [...columns].sort(
            (a, b) =>
                (rank.get(entryId(a)) ?? Number.MAX_SAFE_INTEGER) -
                (rank.get(entryId(b)) ?? Number.MAX_SAFE_INTEGER)
        )
    }, [columns, entryOrder])

    const setColumnDragImage = (
        event: React.DragEvent,
        entryKey: string
    ): void => {
        const container = containerRef.current
        if (!container) return

        const cells = Array.from(
            container.querySelectorAll<HTMLElement>(
                `[data-entry-id="${entryKey}"]`
            )
        )
        if (cells.length === 0) return

        const view = container.getBoundingClientRect()
        const visible = cells
            .map((cell) => ({ cell, rect: cell.getBoundingClientRect() }))
            .filter(
                ({ rect }) =>
                    rect.bottom > view.top &&
                    rect.top < view.bottom &&
                    rect.right > view.left &&
                    rect.left < view.right
            )
        if (visible.length === 0) return

        const left = Math.min(...visible.map(({ rect }) => rect.left))
        const right = Math.max(...visible.map(({ rect }) => rect.right))
        const top = Math.min(...visible.map(({ rect }) => rect.top))
        const bottom = Math.min(
            Math.max(...visible.map(({ rect }) => rect.bottom)),
            view.bottom
        )

        const ghost = document.createElement('div')
        ghost.style.cssText = `position:fixed;top:-10000px;left:-10000px;width:${right - left}px;height:${bottom - top}px;overflow:hidden;background:#ffffff;border-radius:0.5rem;box-shadow:0 8px 20px rgba(15,23,42,0.18);`

        for (const { cell, rect } of visible) {
            const clone = cell.cloneNode(true) as HTMLElement
            const computed = window.getComputedStyle(cell)
            clone.style.fontFamily = computed.fontFamily
            clone.style.fontSize = computed.fontSize
            clone.style.fontWeight = computed.fontWeight
            clone.style.fontStyle = computed.fontStyle
            clone.style.lineHeight = computed.lineHeight
            clone.style.letterSpacing = computed.letterSpacing
            clone.style.color = computed.color
            clone.style.position = 'absolute'
            clone.style.margin = '0'
            clone.style.left = `${rect.left - left}px`
            clone.style.top = `${rect.top - top}px`
            clone.style.width = `${rect.width}px`
            clone.style.height = `${rect.height}px`
            clone.style.opacity = '1'
            ghost.appendChild(clone)
        }

        document.body.appendChild(ghost)
        event.dataTransfer.setDragImage(
            ghost,
            event.clientX - left,
            event.clientY - top
        )
        requestAnimationFrame(() => ghost.remove())
    }

    const moveEntry = (fromId: string, toId: string, after: boolean) => {
        if (fromId === toId) return
        const ids = orderedColumns.map(entryId)
        if (!ids.includes(fromId) || !ids.includes(toId)) return

        const next = ids.filter((id) => id !== fromId)
        const target = next.indexOf(toId)
        next.splice(after ? target + 1 : target, 0, fromId)
        onEntryOrderChange?.(next)
    }

    const flatColumns = useMemo(
        () =>
            orderedColumns.flatMap((entry) =>
                isCategory(entry) ? entry.columns : [entry]
            ),
        [orderedColumns]
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
        const entries: VisibleEntry<T>[] = []
        for (const entry of orderedColumns) {
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
    }, [orderedColumns, collapsedSet])

    const gridTemplateColumns = visibleEntries.map((e) => e.width).join(' ')

    const rowCount = sortedData.length
    const hasRows = rowCount > 0

    useLayoutEffect(() => {
        const row =
            containerRef.current?.querySelector<HTMLElement>('[data-table-row]')
        const header = headerRef.current
        if (!row || !header) return

        const rowHeight = row.getBoundingClientRect().height
        const headerHeight = header.getBoundingClientRect().height

        setMetrics((current) =>
            current.rowHeight === rowHeight &&
            current.headerHeight === headerHeight
                ? current
                : { rowHeight, headerHeight }
        )
    }, [mode, visibleEntries, hasRows])

    useEffect(() => {
        if (
            scrollToRowToken == null ||
            scrollToRowToken === handledScrollToken.current ||
            isScrollTarget == null
        )
            return

        const container = containerRef.current
        if (!container || metrics.rowHeight <= 0) return

        const index = sortedData.findIndex(isScrollTarget)
        if (index === -1) return

        handledScrollToken.current = scrollToRowToken
        const top = index * metrics.rowHeight

        const headerCell = headerRef.current?.querySelector<HTMLElement>(
            `[data-column-key="${scrollToColumnKey ?? ''}"]`
        )
        let left = container.scrollLeft

        if (headerCell) {
            const cellRect = headerCell.getBoundingClientRect()
            const headerRect = headerRef.current!.getBoundingClientRect()
            const cellLeft = cellRect.left - headerRect.left
            const cellRight = cellLeft + cellRect.width
            const viewRight = left + container.clientWidth

            if (cellLeft < left) left = cellLeft
            else if (cellRight > viewRight)
                left = cellRight - container.clientWidth
        }

        container.scrollTo({ top, left, behavior: 'smooth' })
    }, [
        scrollToRowToken,
        isScrollTarget,
        scrollToColumnKey,
        sortedData,
        metrics.rowHeight,
    ])

    const { start, end } = useVirtualRange(
        containerRef,
        metrics,
        rowCount,
        metrics.rowHeight > 0 && rowCount > VIRTUALIZE_THRESHOLD
    )

    useLayoutEffect(() => {
        const header = headerRef.current
        if (!reorderable || !header) return

        const offsets: Record<string, number> = {}
        for (const entry of visibleEntries) {
            const label = entry.category?.label
            if (entry.type !== 'column' || !label || offsets[label] != null)
                continue

            const cells = header.querySelectorAll<HTMLElement>(
                `[data-entry-id="${label}"]`
            )
            if (cells.length < 2) continue

            const first = cells[0].getBoundingClientRect()
            const last = cells[cells.length - 1].getBoundingClientRect()
            offsets[label] = (last.right - first.left) / 2
        }

        setHandleOffsets((current) => {
            const keys = Object.keys(offsets)
            const unchanged =
                keys.length === Object.keys(current).length &&
                keys.every((key) => current[key] === offsets[key])
            return unchanged ? current : offsets
        })
    }, [reorderable, visibleEntries])
    return (
        <div
            className={styles.container}
            data-table-mode={mode}
            ref={containerRef}
        >
            <div
                className={styles.header}
                style={{ gridTemplateColumns }}
                ref={headerRef}
            >
                {visibleEntries.map((entry) => {
                    const dragId = entry.category?.label ?? entry.col?.key ?? ''
                    const groupColumns =
                        entry.type === 'column' && entry.category
                            ? entry.category.columns
                            : null
                    const isEntryStart =
                        !groupColumns || groupColumns[0] === entry.col
                    const isEntryEnd =
                        !groupColumns ||
                        groupColumns[groupColumns.length - 1] === entry.col
                    const entryReorderable =
                        reorderable &&
                        (entry.category != null ||
                            (entry.col?.reorderable ?? true))
                    const isDropTarget =
                        draggingId != null &&
                        dropTarget?.id === dragId &&
                        draggingId !== dragId
                    const dropsOnRightHalf = (event: React.DragEvent) => {
                        const cells =
                            headerRef.current?.querySelectorAll<HTMLElement>(
                                `[data-entry-id="${dragId}"]`
                            )
                        const first = cells?.[0]?.getBoundingClientRect()
                        const last =
                            cells?.[cells.length - 1]?.getBoundingClientRect()
                        const rect = event.currentTarget.getBoundingClientRect()
                        const left = first?.left ?? rect.left
                        const right = last?.right ?? rect.right
                        return event.clientX > (left + right) / 2
                    }
                    const dragProps = entryReorderable
                        ? {
                              draggable: true,
                              onMouseEnter: () => setHoveredEntryId(dragId),
                              onMouseLeave: () => setHoveredEntryId(null),
                              onDragStart: (event: React.DragEvent) => {
                                  setColumnDragImage(event, dragId)
                                  setDraggingId(dragId)
                              },
                              onDragEnd: () => {
                                  setDraggingId(null)
                                  setDropTarget(null)
                              },
                              onDragOver: (event: React.DragEvent) => {
                                  event.preventDefault()
                                  const after = dropsOnRightHalf(event)
                                  setDropTarget((current) =>
                                      current?.id === dragId &&
                                      current.after === after
                                          ? current
                                          : { id: dragId, after }
                                  )
                              },
                              onDrop: (event: React.DragEvent) => {
                                  event.preventDefault()
                                  if (draggingId)
                                      moveEntry(
                                          draggingId,
                                          dragId,
                                          dropsOnRightHalf(event)
                                      )
                                  setDraggingId(null)
                                  setDropTarget(null)
                              },
                          }
                        : {}

                    const dropClass = !isDropTarget
                        ? undefined
                        : dropTarget.after
                          ? isEntryEnd
                              ? styles.dropAfter
                              : undefined
                          : isEntryStart
                            ? styles.dropBefore
                            : undefined

                    const sharedClasses = cn(
                        entryReorderable && styles.draggableHeader,
                        hoveredEntryId === dragId && styles.headerHovered,
                        draggingId === dragId && styles.draggingHeader,
                        dropClass
                    )

                    if (entry.type === 'group-collapsed') {
                        return (
                            <span
                                key={`group-${entry.category!.label}`}
                                data-entry-id={dragId}
                                className={cn(
                                    styles.collapsedHeader,
                                    sharedClasses
                                )}
                                {...dragProps}
                            >
                                {entryReorderable && (
                                    <MdDragIndicator
                                        className={styles.dragHandle}
                                        aria-hidden="true"
                                    />
                                )}
                            </span>
                        )
                    }
                    const col = entry.col!
                    return (
                        <span
                            key={col.key}
                            data-column-key={col.key}
                            data-entry-id={dragId}
                            className={cn(
                                col.sortValue && styles.sortableHeader,
                                sharedClasses
                            )}
                            onClick={
                                col.sortValue
                                    ? () => handleSort(col.key)
                                    : undefined
                            }
                            {...dragProps}
                        >
                            {entryReorderable && isEntryStart && (
                                <MdDragIndicator
                                    className={styles.dragHandle}
                                    style={
                                        handleOffsets[dragId] != null
                                            ? { left: handleOffsets[dragId] }
                                            : undefined
                                    }
                                    aria-hidden="true"
                                />
                            )}
                            <span className={styles.headerLabel}>
                                {col.header}
                                {col.sortValue && (
                                    <span className={styles.sortIcon}>
                                        {sortKey === col.key ? (
                                            sortDir === 'asc' ? (
                                                <FiChevronUp strokeWidth={3} />
                                            ) : (
                                                <FiChevronDown
                                                    strokeWidth={3}
                                                />
                                            )
                                        ) : (
                                            <FiChevronDown strokeWidth={2} />
                                        )}
                                    </span>
                                )}
                            </span>
                        </span>
                    )
                })}
            </div>

            {start > 0 && (
                <div
                    style={{
                        height: start * metrics.rowHeight,
                        flexShrink: 0,
                    }}
                />
            )}

            {sortedData.slice(start, end).map((row, offset) => {
                const index = start + offset
                const rowId = rowKey(row, index)
                const openPrefix = `${rowId}::`

                return (
                    <TableRow
                        key={rowId}
                        row={row}
                        index={index}
                        rowId={rowId}
                        columns={orderedColumns}
                        visibleEntries={visibleEntries}
                        gridTemplateColumns={gridTemplateColumns}
                        mode={mode}
                        zebra={zebra}
                        openColKey={
                            openCell?.startsWith(openPrefix)
                                ? openCell.slice(openPrefix.length)
                                : null
                        }
                        setOpenCell={setOpenCell}
                        draggingEntryId={draggingId}
                    />
                )
            })}

            {end < rowCount && (
                <div
                    style={{
                        height: (rowCount - end) * metrics.rowHeight,
                        flexShrink: 0,
                    }}
                />
            )}
            {footer}
        </div>
    )
}
