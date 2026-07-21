import styles from './List.module.css'
import { MultiSelect, MultiSelectOption } from '@/components/common'
import { SearchRequest, SortDirection } from '@/contracts/requests'
import cx from 'classnames'
import Link from 'next/link'
import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { IconType } from 'react-icons/lib'

export interface FilterOption {
    value: string
    label: string
    options: MultiSelectOption[]
}

export interface FieldOption {
    value: string
    label: string
}

export interface ListProps {
    search: SearchRequest

    count: number | undefined
    isPending: boolean
    error: Error | null

    searchFields?: FieldOption[]
    sortFields?: FieldOption[]
    filters?: FilterOption[]

    pinnedContent?: ReactNode
    children?: ReactNode

    onSearch: (search: SearchRequest) => void

    // NEW: Optional back button shown in the list header
    backHref?: string
    backLabel?: string
}

export function List(props: ListProps) {
    const [searchPanelOpen, setSearchPanelOpen] = useState(false)

    return (
        <div className={styles.list}>
            <ListTop
                {...props}
                searchPanelOpen={searchPanelOpen}
                setSearchPanelOpen={setSearchPanelOpen}
                mode="full"
            />

            <ListBody {...props} />

            <ListBottom {...props} />
        </div>
    )
}
export type ListTopMode = 'full' | 'compact'

export interface ListTopProps extends Pick<
    ListProps,
    | 'search'
    | 'searchFields'
    | 'sortFields'
    | 'filters'
    | 'onSearch'
    | 'backHref'
    | 'backLabel'
> {
    searchPanelOpen?: boolean
    setSearchPanelOpen?: (next: boolean) => void

    mode?: ListTopMode

    className?: string
}

export function ListTop({
    search,
    searchFields,
    sortFields,
    filters,
    onSearch,
    searchPanelOpen,
    setSearchPanelOpen,
    mode = 'full',
    className,
    backHref,
    backLabel = 'Back',
}: ListTopProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

    const isControlled =
        typeof searchPanelOpen === 'boolean' &&
        typeof setSearchPanelOpen === 'function'

    const panelOpen = isControlled ? searchPanelOpen : uncontrolledOpen
    const setPanelOpen = isControlled ? setSearchPanelOpen : setUncontrolledOpen

    const { query, searchField, sortField, limit, sort, page, ...filter } =
        search

    const handleToggleSearchPanel = () => {
        setPanelOpen(!panelOpen)
    }

    const handleChangeQuery = (query: string) => {
        onSearch({ ...search, query, page: 0 })
    }

    const handleChangeSearchField = (searchField: string | undefined) => {
        onSearch({ ...search, searchField, page: 0 })
    }

    const handleChangeSortField = (sortField: string | undefined) => {
        onSearch({ ...search, sortField, page: 0 })
    }

    const handleChangeLimit = (limit: number) => {
        onSearch({ ...search, limit, page: 0 })
    }

    const handleChangeSort = (sort: SortDirection) => {
        onSearch({ ...search, sort, page: 0 })
    }

    const handleChangeFilter = (
        nextFilters: Record<string, (number | string)[] | undefined>
    ) => {
        onSearch({
            query,
            searchField,
            sortField,
            limit,
            sort,
            page,
            ...nextFilters,
        })
    }

    return (
        <div className={cx(styles.searchPanel, className)}>
            <div className={styles.searchRow}>
                {backHref ? (
                    <Link
                        href={backHref}
                        className={styles.backIconButton}
                        title={backLabel}
                        aria-label={backLabel}
                    >
                        <FiChevronsLeft size={20} />
                    </Link>
                ) : null}

                <div className={styles.searchRowMain}>
                    <SearchInput
                        query={query ?? ''}
                        panelOpen={panelOpen}
                        onTogglePanel={handleToggleSearchPanel}
                        onSearch={handleChangeQuery}
                    />
                </div>
            </div>

            {mode === 'full' && panelOpen && (
                <>
                    <div className={styles.searchPanelTop}>
                        <FieldSelect
                            label="Search Field"
                            field={searchField}
                            options={searchFields ?? []}
                            onSelect={handleChangeSearchField}
                        />
                        <FieldSelect
                            label="Sort Field"
                            field={sortField}
                            options={sortFields ?? []}
                            onSelect={handleChangeSortField}
                        />
                        <LimitSelect
                            limit={limit ?? 25}
                            onSelect={handleChangeLimit}
                        />
                    </div>

                    <SortSelect
                        sort={sort ?? SortDirection.DESC}
                        onSelect={handleChangeSort}
                    />

                    <FilterSelect
                        filters={filter}
                        options={filters}
                        onChange={handleChangeFilter}
                    />
                </>
            )}
        </div>
    )
}

type ListBodyProps = Pick<
    ListProps,
    'count' | 'isPending' | 'error' | 'pinnedContent' | 'children'
>

export function ListBody({
    count,
    isPending,
    error,
    pinnedContent,
    children,
}: ListBodyProps) {
    if (count == null) {
        return (
            <div className={styles.listStatus}>
                {isPending ? (
                    <span color="#9ca3af">Loading...</span>
                ) : error ? (
                    <span color="#ef4444">Error: {error.message}</span>
                ) : (
                    <span>No results found</span>
                )}
            </div>
        )
    }

    return (
        <>
            {pinnedContent && (
                <ul className={styles.pinned}>{pinnedContent}</ul>
            )}
            <ul className={styles.elementList}>{children}</ul>
        </>
    )
}

export function ListBottom({
    search,
    count,
    isPending,
    onSearch,
}: Pick<ListProps, 'search' | 'count' | 'isPending' | 'onSearch'>) {
    if (count == null) return null

    const page = search.page ?? 0
    const limit = search.limit

    const handleChangePage = (page: number) => {
        onSearch({ ...search, page })
    }

    return (
        <div className={styles.pageSelectContainer}>
            <PageSelect
                page={page}
                pageSize={limit ?? 25}
                count={count}
                disabled={isPending}
                onChange={handleChangePage}
            />
        </div>
    )
}

export interface ListElementProps {
    selected?: boolean
    className?: string
    children?: React.ReactNode
    onClick?: () => void
}

export function ListElement({
    selected,
    children,
    className,
    onClick,
}: ListElementProps) {
    return (
        <li className={className} onClick={onClick}>
            <div className={cx(styles.element, selected && styles.selected)}>
                {children}
            </div>
        </li>
    )
}

interface SearchInputProps {
    query: string
    panelOpen: boolean
    onTogglePanel: () => void
    onSearch: (query: string) => void
}

function SearchInput({
    query,
    panelOpen,
    onTogglePanel,
    onSearch,
}: SearchInputProps) {
    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value)
    }

    return (
        <div className={styles.searchInput}>
            <input
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                defaultValue={query}
                onInput={handleSearch}
            />
            <button
                title={panelOpen ? 'Hide Filters' : 'Show Filters'}
                onClick={onTogglePanel}
            >
                {panelOpen ? <IoClose size={20} /> : <IoMdOptions size={20} />}
            </button>
        </div>
    )
}

interface FieldSelectProps {
    label: string
    field: string | undefined
    options: FieldOption[]
    optional?: boolean
    onSelect: (field: string | undefined) => void
}

function FieldSelect({
    label,
    field,
    options,
    optional,
    onSelect,
}: FieldSelectProps) {
    if (!options.length) return null

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        onSelect(value == 'all' ? undefined : value)
    }

    return (
        <label htmlFor="field" className={styles.select}>
            <span>{label}:</span>
            <select
                name="field"
                id="field"
                defaultValue={field ?? 'all'}
                onChange={handleChange}
            >
                {optional && <option value={'all'}>All</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}

interface LimitSelectProps {
    limit: number
    onSelect: (limit: number) => void
}

function LimitSelect({ limit, onSelect }: LimitSelectProps) {
    return (
        <label htmlFor="limit" className={styles.select}>
            <span>Items:</span>
            <select
                name="limit"
                id="limit"
                defaultValue={limit}
                onChange={(e) => onSelect(+e.target.value)}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </label>
    )
}

interface SortSelectProps {
    sort: SortDirection
    onSelect: (sort: SortDirection) => void
}

function SortSelect({ sort, onSelect }: SortSelectProps) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as SortDirection
        onSelect(value)
    }

    return (
        <label htmlFor="sort" className={styles.select}>
            <span>Sort:</span>
            <select
                name="sort"
                id="sort"
                defaultValue={sort ?? SortDirection.ASC}
                onChange={handleChange}
            >
                <option value={SortDirection.ASC}>Ascending</option>
                <option value={SortDirection.DESC}>Descending</option>
            </select>
        </label>
    )
}

interface FilterSelectProps {
    options: FilterOption[] | undefined
    filters: Record<string, (string | number)[]>
    onChange: (filters: Record<string, (string | number)[]>) => void
}

function FilterSelect({ options, filters, onChange }: FilterSelectProps) {
    const handleUpdate = (value: string, selected: (string | number)[]) => {
        const newFilters = { ...filters }
        if (selected.length) newFilters[value] = selected
        else delete newFilters[value]
        onChange(newFilters)
    }

    return (
        <>
            {options?.map((option) => (
                <div key={option.label} className={styles.filterSelect}>
                    <strong>{option.label}:</strong>
                    <MultiSelect
                        name={option.label}
                        options={option.options}
                        selected={filters[option.value] ?? []}
                        onUpdate={(selected) =>
                            handleUpdate(option.value, selected)
                        }
                    />
                </div>
            ))}
        </>
    )
}

interface PageSelectProps {
    page: number
    count: number
    pageSize: number
    disabled?: boolean
    onChange: (page: number) => void
}

function PageSelect({
    page,
    count,
    pageSize,
    disabled,
    onChange,
}: PageSelectProps) {
    const [value, setValue] = useState('')

    const pageCount = Math.ceil(count / pageSize)
    const canNavigate = pageCount > 1
    const maxPage = pageCount - 1

    const handleChangeValue = (value: string) => {
        if (!value || (/^\d+$/.test(value) && value.length < 10))
            setValue(value)
    }

    const handleSubmit = () => {
        const newPage = +value - 1
        if (0 <= newPage && newPage <= maxPage) onChange(newPage)
        else setValue((page + 1).toString())
    }

    useEffect(() => {
        setValue((page + 1).toString())
    }, [page])

    useEffect(() => {
        if (page < 0) onChange(0)
        else if (maxPage >= 0 && page > maxPage) onChange(maxPage)
    }, [page, maxPage, onChange])

    return (
        <div className={styles.pageSelect}>
            <div className={styles.pageSelectButtons}>
                <PaginationArrow
                    onClick={() => onChange(0)}
                    icon={FiChevronsLeft}
                    title="First"
                    enabled={canNavigate && page > 0}
                />
                <PaginationArrow
                    onClick={() => onChange(page - 1)}
                    icon={FiChevronLeft}
                    title="Previous"
                    enabled={canNavigate && page > 0}
                />
                <form
                    className={styles.pageSelectForm}
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}
                >
                    <input
                        id="page"
                        type="text"
                        value={value}
                        disabled={disabled}
                        onBlur={handleSubmit}
                        onChange={(e) => handleChangeValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur()
                            }
                        }}
                        className={styles.pageSelectInput}
                    />
                    <input type="submit" hidden />
                    <span className={styles.pageSelectSpan} color="#4b5563">
                        of{' '}
                        <span title={`${count} total results`}>
                            {pageCount}
                        </span>
                    </span>
                </form>
                <PaginationArrow
                    onClick={() => onChange(page + 1)}
                    icon={FiChevronRight}
                    title="Next"
                    enabled={canNavigate && page < maxPage}
                />
                <PaginationArrow
                    onClick={() => onChange(maxPage)}
                    icon={FiChevronsRight}
                    title="Last"
                    enabled={canNavigate && page < maxPage}
                />
            </div>
        </div>
    )
}

interface PaginationArrowProps {
    onClick: () => void
    icon: IconType
    title: string
    enabled: boolean
}

function PaginationArrow({
    onClick,
    icon: Icon,
    title,
    enabled,
}: PaginationArrowProps) {
    return (
        <a
            className={cx(
                styles.arrow,
                enabled ? styles.enabled : styles.disabled
            )}
            onClick={() => enabled && onClick()}
            title={title}
        >
            <Icon size={20} />
        </a>
    )
}
