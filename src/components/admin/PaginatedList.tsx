import styles from './PaginatedList.module.css'
import { MultiSelect, MultiSelectOption } from '@/components/common'
import { SearchRequest, SortDirection } from '@/contracts/requests'
import cx from 'classnames'
import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
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

export interface PaginatedListProps {
    search: SearchRequest

    count: number | undefined
    isPending: boolean
    error: Error | null

    fields?: FieldOption[]
    filters?: FilterOption[]

    pinnedContent?: ReactNode
    children?: ReactNode

    onSearch: (search: SearchRequest) => void
}

export function PaginatedList({
    search,
    count,
    isPending,
    error,
    fields,
    filters,
    pinnedContent,
    children,
    onSearch,
}: PaginatedListProps) {
    const [searchPanelOpen, setSearchPanelOpen] = useState(false)

    const { query, field, limit, sort, page, ...filter } = search

    const handleToggleSearchPanel = () => {
        setSearchPanelOpen((prev) => !prev)
    }

    const handleChangeQuery = (query: string) => {
        onSearch({ ...search, query })
    }

    const handleChangeField = (field: string | undefined) => {
        onSearch({ ...search, field })
    }

    const handleChangeLimit = (limit: number) => {
        onSearch({ ...search, limit })
    }

    const handleChangeSort = (sort: SortDirection | undefined) => {
        onSearch({ ...search, sort })
    }

    const handleChangeFilter = (
        filter: Record<string, (number | string)[] | undefined>
    ) => {
        onSearch({ query, field, limit, sort, page, ...filter })
    }

    const handleChangePage = (page: number) => {
        onSearch({ ...search, page })
    }

    return (
        <div className={styles.list}>
            <div className={styles.searchPanel}>
                <SearchInput
                    query={query ?? ''}
                    panelOpen={searchPanelOpen}
                    onTogglePanel={handleToggleSearchPanel}
                    onSearch={handleChangeQuery}
                />

                {searchPanelOpen && (
                    <>
                        <div className={styles.searchPanelTop}>
                            <FieldSelect
                                field={field}
                                options={fields ?? []}
                                onSelect={handleChangeField}
                            />
                            <LimitSelect
                                limit={limit}
                                onSelect={handleChangeLimit}
                            />
                        </div>
                        <SortSelect sort={sort} onSelect={handleChangeSort} />
                        <FilterSelect
                            filters={filter}
                            options={filters}
                            onChange={handleChangeFilter}
                        />
                    </>
                )}
            </div>

            {count == null && (
                <div className={styles.listStatus}>
                    {isPending ? (
                        <span color="#9ca3af">Loading...</span>
                    ) : error ? (
                        <span color="#ef4444">Error: {error.message}</span>
                    ) : (
                        <span>No results found</span>
                    )}
                </div>
            )}

            {count != null && (
                <>
                    {pinnedContent && (
                        <ul className={styles.pinned}>{pinnedContent}</ul>
                    )}

                    <ul className={styles.elementList}>{children}</ul>

                    <div className={styles.pageSelectContainer}>
                        <PageSelect
                            page={page ?? 0}
                            pageSize={limit}
                            count={count}
                            disabled={isPending}
                            onChange={handleChangePage}
                        />
                    </div>
                </>
            )}
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
    field: string | undefined
    options: FieldOption[]
    onSelect: (field: string | undefined) => void
}

function FieldSelect({ field, options, onSelect }: FieldSelectProps) {
    if (!options.length) return null

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        onSelect(value == 'all' ? undefined : value)
    }

    return (
        <label htmlFor="field" className={styles.select}>
            <span>Filter:</span>
            <select
                name="field"
                id="field"
                defaultValue={field ?? 'all'}
                onChange={handleChange}
            >
                <option value={'all'}>All</option>
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
    sort: SortDirection | undefined
    onSelect: (sort: SortDirection | undefined) => void
}

function SortSelect({ sort, onSelect }: SortSelectProps) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as SortDirection | 'none'
        onSelect(value == 'none' ? undefined : value)
    }

    return (
        <label htmlFor="sort" className={styles.select}>
            <span>Sort:</span>
            <select
                name="sort"
                id="sort"
                defaultValue={sort ?? 'none'}
                onChange={handleChange}
            >
                <option value="none">None</option>
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
                        type="text"
                        value={value}
                        disabled={disabled}
                        onBlur={handleSubmit}
                        onChange={(e) => handleChangeValue(e.target.value)}
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
